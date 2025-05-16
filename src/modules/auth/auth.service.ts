import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ErpManager } from 'src/erp/erp.manager';
import { User } from '../user/entities/user.entity';
import { UsersTypes } from '../user/enums/UsersTypes';

import { RegisterDto } from './dto/register.dto';
import { ValidationDto } from './dto/validation.dto';
import { RestorePasswordStepOneDto } from './dto/restore-password-step-one.dto';
import { RestorePasswordStepTwoDto } from './dto/restore-password-step-two.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly erpManager: ErpManager,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  //
  // Public API
  //

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOneBy({ username: dto.username });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const passwordsMatch = dto.password === user.password
    if (!passwordsMatch) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }

    this.ensureNotBlocked(user);

    return user;
  }

  async validate(dto: ValidationDto) {
    const user = await this.findOrCreateUser(dto.extId, dto.phone);

    this.ensureNotBlocked(user);
    if (user.isRegistered) {
      throw new HttpException('לקוח רשום', HttpStatus.BAD_REQUEST);
    }

    user.recovery = this.generateRecoveryCode(6);
    user.updatedAt = new Date();
    await this.userRepo.save(user);

    return { exId: user.extId, name: user.name };
  }

  async register(dto: RegisterDto) {
    const user = await this.getExistingUser(dto.extId, dto.phone);
    this.ensureRegistrable(user, +dto.token);

    user.isRegistered = true;
    user.username = dto.username;
    user.password = await this.hashPassword(dto.password); 
    user.recovery = this.generateRecoveryCode(6);
    user.updatedAt = new Date();

    await this.userRepo.save(user);
    return { success: true, message: 'user created' };
  }

  async restorePasswordStepOne(dto: RestorePasswordStepOneDto) {
    const user = await this.getByUsername(dto.username);
    this.ensureNotBlocked(user);

    user.recovery = this.generateRecoveryCode(5);
    user.updatedAt = new Date();
    await this.userRepo.save(user);

    return { username:user?.username ,message: 'נשלח קוד סודי לאימות' };
  }

  async restorePasswordStepTwo(dto: RestorePasswordStepTwoDto) {
    const user = await this.getByUsername(dto.username);
    this.ensureNotBlocked(user);
    if (user.recovery.toString() !== dto.token) {
      throw new HttpException('קוד סודי אינו תקין', HttpStatus.BAD_REQUEST);
    }

    user.password = await this.hashPassword(dto.password);
    user.updatedAt = new Date();
    await this.userRepo.save(user);

    return { message: 'נשלח קוד סודי לאימות' };
  }

  async createUser(dto: CreateUserDto) {
    const user = this.userRepo.create({
      extId: '999999',
      name: dto.fullName,
      email: dto.email,
      phone: dto.phone,
      password: await this.hashPassword(dto.password),
      recovery: this.generateRecoveryCode(6, 900_000),
      isRegistered: true,
      isBlocked: false,
      isAllowOrder: false,
      isAllowAllClients: false,
      role: UsersTypes.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepo.save(user);
    return { success: true, message: 'לקוח נוצר בהצלחה!' };
  }

  async createAgent(dto: CreateAgentDto) {
    const user = this.userRepo.create({
      extId: dto.extId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      password: await this.hashPassword(dto.password),
      recovery: this.generateRecoveryCode(6, 900_000),
      isRegistered: true,
      isBlocked: false,
      isAllowOrder: dto.isAllowOrder,
      isAllowAllClients: dto.isAllowAllClients,
      role: UsersTypes.AGENT,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.userRepo.save(user);
    return { success: true, message: 'סוכן נוצר בהצלחה!' };
  }

  async updateUser(dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id: dto.id } });
    if (!user) {
      throw new HttpException('לא נמצא לקוח', HttpStatus.BAD_REQUEST);
    }

    Object.assign(user, {
      extId: dto.extId,
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      role: dto.role ?? user.role,
      isRegistered: dto.isRegistered,
      isBlocked: dto.isBlocked,
      isAllowOrder: dto.isAllowOrder,
      isAllowAllClients: dto.isAllowAllClients,
      password: dto.password,
      updatedAt: new Date(),
    });

    try {
      await this.userRepo.save(user);
    } catch {
      throw new HttpException('לקוח עם מייל כזה נמצא', HttpStatus.CONFLICT);
    }

    return { success: true, message: 'יוזר עודכן בהצלחה!' };
  }

  //
  // Helpers
  //

  private async getExistingUser(extId: string, phone: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ extId, phone });
    if (!user) {
      throw new HttpException('לא נמצא לקוח', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  private async getByUsername(username: string): Promise<User> {
    const user = await this.userRepo.findOneBy({ username });
    if (!user) {
      throw new HttpException('לא נמצא לקוח', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  private async findOrCreateUser(extId: string, phone: string): Promise<User> {
    let user = await this.userRepo.findOneBy({ extId, phone });
    if (user) {
      return user;
    }

    const online = await this.erpManager.FindUser({ userExtId: extId, phone });
    if (!online) {
      throw new HttpException('לא נמצא לקוח', HttpStatus.BAD_REQUEST);
    }

    user = this.userRepo.create({
      extId: online.userExId,
      name: online.name!,
      phone: online.phone!,
      isBlocked: online.isBlocked ?? false,
      isRegistered: false,
      recovery: 0,
      role: UsersTypes.USER,
      isAllowOrder: false,
      isAllowAllClients: false,
      isAgent: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return this.userRepo.save(user);
  }

  private ensureNotBlocked(user: User) {
    if (user.isBlocked) {
      throw new HttpException('לקוח חסום', HttpStatus.FORBIDDEN);
    }
  }

  private ensureRegistrable(user: User, token: number) {
    if (user.isBlocked) {
      throw new HttpException('לקוח חסום', HttpStatus.FORBIDDEN);
    }
    if (user.isRegistered) {
      throw new HttpException('לקוח רשום', HttpStatus.BAD_REQUEST);
    }
    if (user.recovery !== token) {
      throw new HttpException('קוד סודי שגוי', HttpStatus.BAD_REQUEST);
    }
  }

  private generateRecoveryCode(
    length: number,
    min: number = Math.pow(10, length - 1),
  ): number {
    const max = Math.pow(10, length) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Stubbed—returns the raw password. Replace with your chosen mechanism.
  private async hashPassword(password: string): Promise<string> {
    return password;
  }
}
