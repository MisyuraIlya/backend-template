import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";

import { ErpManager } from "src/erp/erp.manager";
import { PriceListUser } from "src/modules/price-list-user/entities/price-list-user.entity";
import { User } from "src/modules/user/entities/user.entity";
import { PriceList } from "src/modules/price-list/entities/price-list.entity";

export interface PriceListUserDto {
  userExId?: string | null;
  priceListExId?: string | null;
}

@Injectable()
export class GetPriceListUserService {
  private readonly logger = new Logger(GetPriceListUserService.name);
  public isSyncing = false;

  constructor(
    @InjectRepository(PriceListUser)
    private readonly priceListUserRepo: Repository<PriceListUser>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(PriceList)
    private readonly priceListRepo: Repository<PriceList>,

    private readonly erpManager: ErpManager,
  ) {}

  /**
   * Main sync logic:
   * - Fetch ERP data
   * - Build maps of existing User & PriceList entities by their external IDs
   * - Expire any old links
   * - Create (or update) new PriceListUser records
   */
  public async sync(): Promise<void> {
    const data: PriceListUserDto[] = await this.erpManager.GetPriceListUser();

    if (!Array.isArray(data) || data.length === 0) {
      this.logger.warn("No data returned from ERP");
      return;
    }

    const userExIds = Array.from(
      new Set(data.map((d) => d.userExId).filter((id): id is string => !!id))
    );
    const priceListExIds = Array.from(
      new Set(data.map((d) => d.priceListExId).filter((id): id is string => !!id))
    );

    const [users, priceLists] = await Promise.all([
      this.userRepo.find({ where: { extId: In(userExIds) } }),
      this.priceListRepo.find({ where: { extId: In(priceListExIds) } }),
    ]);

    const userMap = new Map<string, User>();
    users.forEach((u) => userMap.set(u.extId!, u));
    const priceListMap = new Map<string, PriceList>();
    priceLists.forEach((p) => priceListMap.set(p.extId!, p));

    const now = new Date();
    await this.priceListUserRepo
      .createQueryBuilder()
      .update()
      .set({ expiredAt: now })
      .where("expiredAt IS NULL")
      .execute();

    const toSave: PriceListUser[] = [];
    for (const dto of data) {
      if (!dto.userExId || !dto.priceListExId) {
        this.logger.warn(
          `Skipping DTO with missing IDs: ${JSON.stringify(dto)}`
        );
        continue;
      }
      const user = userMap.get(dto.userExId);
      const priceList = priceListMap.get(dto.priceListExId);

      if (!user) {
        this.logger.warn(`User not found: ${dto.userExId}`);
        continue;
      }
      if (!priceList) {
        this.logger.warn(`PriceList not found: ${dto.priceListExId}`);
        continue;
      }

      const plu = this.priceListUserRepo.create({
        user,
        priceList,
      });
      toSave.push(plu);
    }

    if (toSave.length > 0) {
      await this.priceListUserRepo.save(toSave);
      this.logger.log(`Imported ${toSave.length} price-list-user links`);
    } else {
      this.logger.log("No new price-list-user links to save");
    }
  }

  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log({
        context: GetPriceListUserService.name,
        level: 'info',
        message: 'Previous sync still running — skipping this tick',
        CRON_SUCCEEDED: false,
      });
      return;
    }
    this.isSyncing = true;
    const start = Date.now();
    try {
      await this.sync();
      const durationMs = Date.now() - start;
      this.logger.log({
        context: GetPriceListUserService.name,
        level: 'info',
        message: `Cron job: ERP price-list user sync completed successfully in ${durationMs}ms`,
        CRON_SUCCEEDED: true,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error({
        context: GetPriceListUserService.name,
        message: `Cron job: ERP price-list user sync failed after ${durationMs}ms`,
        CRON_SUCCEEDED: false,
        durationMs,
        stack: (err as Error).stack,
      });
      throw err;
    } finally {
      this.isSyncing = false;
    }
  }
}
