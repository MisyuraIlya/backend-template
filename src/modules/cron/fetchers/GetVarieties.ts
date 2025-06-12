import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ErpManager } from "src/erp/erp.manager";
import { Variety } from "src/modules/variety/entities/variety.entity";
import { VarietyDto } from "src/erp/dto/variety.dto";
import { User } from "src/modules/user/entities/user.entity";
import { Product } from "src/modules/product/entities/product.entity";

@Injectable()
export class GetVarietiesService {
  private readonly logger = new Logger(GetVarietiesService.name);
  public isSyncing = false;

  constructor(
    @InjectRepository(Variety)
    private readonly varietyRepository: Repository<Variety>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly erpManager: ErpManager,
  ) {}


  public async sync(): Promise<void> {
    const data = await this.erpManager.GetVariety();
    data?.forEach(async (element: VarietyDto) => {
        const product = await this.productRepository.findOneBy({sku:element.sku})
        const user = await this.userRepository.findOneBy({extId: element.userExtId})
        if(product && user){
            let variety = await this.varietyRepository.findOne({
                where:{
                    sku:product,
                    user:user
                }
            })
            if(!variety){
                variety = new Variety();
                variety.sku = product
                variety.user = user
                variety.createdAt = new Date()
            }
            variety.isPublished = true
            variety.updatedAt = new Date();
            this.varietyRepository.save(variety)
        }

    });

  }

  public async handleCron(): Promise<void> {
    if (this.isSyncing) {
      this.logger.log({
        context: GetVarietiesService.name,
        level: 'info',
        message: 'Previous sync still running — skipping this tick',
      });
      return;
    }
    this.isSyncing = true;
    const start = Date.now();
    try {
      await this.sync();
      const durationMs = Date.now() - start;
      this.logger.log({
        context: GetVarietiesService.name,
        level: 'info',
        message: 'Cron job: ERP varieties sync completed successfully',
        CRON_SUCCEEDED: true,
        durationMs,
      });
    } catch (err) {
      const durationMs = Date.now() - start;
      this.logger.error({
        context: GetVarietiesService.name,
        message: 'Cron job: ERP varieties sync failed',
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
