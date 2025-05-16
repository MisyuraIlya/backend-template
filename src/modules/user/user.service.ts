import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { ErpManager } from 'src/erp/erp.manager';
import { UsersTypes } from './enums/UsersTypes';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly erpManager: ErpManager,

  ) {
    super(userRepository);
  }

  async getUserProfile(userId: number){
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const response = await this.erpManager.GetUserProfile(user?.extId)
    return response
  }

  async getSalesKeeper(userId: number){
   const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }
    const response = await this.erpManager.SalesKeeperAlert(user?.extId)
    return response
  }

  async getQuantityKeeper(userId: number){
    const user = await this.userRepository.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User with id ${userId} not found`);
      }
      const response = await this.erpManager.SalesQuantityKeeperAlert(user?.extId)
      return response
    }

  async getAgentClients(
    userId: number,
    { page, limit, search, status },
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    let baseWhere: FindOptionsWhere<User>;
    switch (user.role) {
      case UsersTypes.SUPER_AGENT:
        baseWhere = { role: UsersTypes.USER };
        break;
      case UsersTypes.AGENT:
        baseWhere = { agent: { id: userId } as any };
        break;
      default:
        throw new ForbiddenException(
          `User with role ${user.role} cannot list clients`,
        );
    }

    if (status === 'active') {
      baseWhere.isRegistered = true;
    } else if (status === 'inactive') {
      baseWhere.isRegistered = false;
    }

    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[];
    if (search) {
      const q = `%${search}%`;
      where = [
        { ...baseWhere, name: ILike(q) },
        { ...baseWhere, extId: ILike(q) },
      ];
    } else {
      where = baseWhere;
    }

    const take = limit;
    const skip = (page - 1) * take;
    const [clients, count] = await this.userRepository.findAndCount({
      where,
      relations: ['agent'],
      order: { name: 'ASC' },
      skip,
      take,
    });

    return {
      page: +page,
      size: take,
      pageCount: Math.ceil(count / take),
      total: count,
      data: clients,
    };
  }
}
