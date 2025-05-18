import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { FindOptionsWhere, ILike, In, Repository } from 'typeorm';
import { ErpManager } from 'src/erp/erp.manager';
import { UsersTypes } from './enums/UsersTypes';
import { AgentStatisticDto, AgentStatisticLine, MonthlyTotalWithTarget } from 'src/erp/dto/agentStatistic.dto';
import { AgentTarget } from '../agent-target/entities/agent-target.entity';
import { AgentObjective } from '../agent-objective/entities/agent-objective.entity';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly erpManager: ErpManager,
    @InjectRepository(AgentTarget)
    private readonly agentTargetRepository: Repository<AgentTarget>,
    @InjectRepository(AgentObjective)
    private readonly agentObjectiveRepository: Repository<AgentObjective>,

  ) {
    super(userRepository);
  }

  async findWithFilters(
    where: FindOptionsWhere<User>,
    opts: { page: number; limit: number },
  ) {
    const skip = (opts.page - 1) * opts.limit;
    const [data, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: opts.limit,
      order: { name: 'ASC' },
    });

    return {
      page:      opts.page,
      size:      opts.limit,
      pageCount: Math.ceil(total / opts.limit),
      total,
      data,
    };
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
      case UsersTypes.ADMIN:
          baseWhere = { role: UsersTypes.USER };
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

  async getAgentsStatistic(dateFrom: Date, dateTo: Date) {
    const agents = await this.userRepository.find({
      where: { role: In([UsersTypes.AGENT, UsersTypes.SUPER_AGENT]) },
      relations: ['usersAgent', 'agentTargets'],
    });

    const statsPromises = agents.map(agent =>
      this.erpManager
        .GetAgentStatistic(agent.extId, dateFrom.toISOString(), dateTo.toISOString())
        .then(dto => ({ agent, dto }))
    );
    const statsResults = await Promise.all(statsPromises);

    let total = 0;
    let totalOrders = 0;
    const lines: AgentStatisticLine[] = [];

    for (const { agent, dto } of statsResults) {
      total += dto.totalPriceChoosedDates;
      totalOrders += dto.totalInvoicesChoosedDates;

      const totalClients = agent.usersAgent?.length ?? 0;

      const monthlyTotals: MonthlyTotalWithTarget[] = dto.monthlyTotals.map(item => {
        const targetEntry = agent.agentTargets?.find(t => t.month === item.monthTitle);
        const target = targetEntry?.targetValue ?? 0;
        const succeed = targetEntry != null ? item.total >= target : null;
        return { ...item, target, succeed };
      });

      lines.push({
        agentName:       agent.name,
        agentExtId:      agent.extId,
        totalPriceMonth: dto.totalPriceMonth,
        total:           dto.totalPriceChoosedDates,
        totalOrders:     dto.totalInvoicesChoosedDates,
        averageBasket:   dto.averageTotalBasketChoosedDates,
        totalClients,
        monthlyTotals,
        totalPriceDay:   dto.totalPriceToday,
        totalDayCount:   dto.totalInvoicesToday,
        totalMonthCount: dto.totalPriceMonth,
        totalMissions:   0,
        targetPercent:   0,
      });
    }

    const averageTotal = totalOrders > 0 ? total / totalOrders : 0;

    return { lines, total, totalOrders, averageTotal };
  }

  async getAgentStatistic(
    agentId: number,
    dateFrom: Date,
    dateTo: Date,
  ) {
    const agent = await this.userRepository.findOne({
      where: { id: agentId },
      relations: ['usersAgent', 'agentTargets'],
    });
    if (!agent) {
      throw new NotFoundException(`Agent with id ${agentId} not found`);
    }

    const dto = await this.erpManager.GetAgentStatistic(
      agent.extId,
      dateFrom.toISOString(),
      dateTo.toISOString(),
    );

    const totalClients = agent.usersAgent?.length ?? 0;

    const monthlyTotals: MonthlyTotalWithTarget[] = dto.monthlyTotals.map(item => {
      const targetEntry = agent.agentTargets?.find(t => t.month === item.monthTitle);
      const target = targetEntry?.targetValue ?? 0;
      const succeed = targetEntry != null ? item.total >= target : null;
      return { ...item, target, succeed };
    });

    return {
      agentName:       agent.name,
      agentExtId:      agent.extId,
      totalPriceMonth: dto.totalPriceMonth,
      total:           dto.totalPriceChoosedDates,
      totalOrders:     dto.totalInvoicesChoosedDates,
      averageBasket:   dto.averageTotalBasketChoosedDates,
      totalClients,
      monthlyTotals,
      totalPriceDay:   dto.totalPriceToday,
      totalDayCount:   dto.totalInvoicesToday,
      totalMonthCount: dto.totalPriceMonth,
      totalMissions:   0,
      targetPercent:   0,
    };
  }

  async agentCalendar(
    agentId: number,
    dateFrom: Date,
    dateTo: Date,
  ): Promise<AgentObjective[]> {
    const agent = await this.userRepository.findOneBy({ id: agentId });
    if (!agent) {
      throw new NotFoundException(`Agent with id ${agentId} not found`);
    }
  
    const missions = await this.agentObjectiveRepository
      .createQueryBuilder('ao')
      .leftJoinAndSelect('ao.agent', 'agent')
      .leftJoinAndSelect('ao.client', 'client')
      .where('ao.agent = :agentId', { agentId })
      .andWhere('ao.date >= :from', { from: dateFrom.toISOString() })
      .andWhere('ao.date <= :to',   { to:   dateTo.toISOString() })
      .orderBy('ao.hourFrom', 'ASC')
      .getMany();
  
    const byDay: Record<string, AgentObjective[]> = {};
    for (const m of missions) {
      const dateObj = m.date instanceof Date
        ? m.date
        : new Date(m.date);
  
      const dayKey = dateObj.toISOString().split('T')[0];
      (byDay[dayKey] = byDay[dayKey] || []).push({
        ...m,
        date: dateObj,
      });
    }
  
    const mergedPerDay = Object.values(byDay).map(dayMissions =>
      this.mergeOverlappedTimes(dayMissions)
    );
  
    return mergedPerDay.flat();
  }

  private mergeOverlappedTimes(tasks: AgentObjective[]): AgentObjective[] {
    if (!tasks.length) return [];
  
    const sorted = tasks.slice().sort((a, b) =>
      a.hourFrom.localeCompare(b.hourFrom)
    );
  
    const merged: AgentObjective[] = [];
    let current = { ...sorted[0] };
  
    for (let i = 1; i < sorted.length; i++) {
      const next = sorted[i];
      const currentEnd = Number(current.hourTo);
      const nextStart  = Number(next.hourFrom);
  
      if (!isNaN(currentEnd) && !isNaN(nextStart) && nextStart <= currentEnd) {
        const nextEnd = Number(next.hourTo);
        const maxEnd  = Math.max(currentEnd, isNaN(nextEnd) ? currentEnd : nextEnd);
        current.hourTo = maxEnd.toString();
      } else {
        merged.push(current);
        current = { ...next };
      }
    }
  
    merged.push(current);
    return merged;
  }



}
