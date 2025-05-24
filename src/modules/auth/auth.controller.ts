import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ValidationDto } from './dto/validation.dto';
import { RestorePasswordStepOneDto } from './dto/restore-password-step-one.dto';
import { RestorePasswordStepTwoDto } from './dto/restore-password-step-two.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';
import { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Public } from 'src/common/decorators/public.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { User } from '../user/entities/user.entity';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
@Throttle({ default: { limit: 5, ttl: 30_000 } })
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(user,response);
  }
  
  @Post('refresh')
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.login(user, response);
  }

  
  @Post('validation')
  @Public()
  async validate(@Body() dto: ValidationDto) {
    return this.authService.validate(dto);
  }

  @Post('registration')
  @Public()
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('restore-password/step-one')
  @Public()
  async restoreStepOne(@Body() dto: RestorePasswordStepOneDto) {
    return this.authService.restorePasswordStepOne(dto);
  }

  @Post('restore-password/step-two')
  @Public()
  async restoreStepTwo(@Body() dto: RestorePasswordStepTwoDto) {
    return this.authService.restorePasswordStepTwo(dto);
  }

  @Post('create-user')
  @Public()
  async createUser(@Body() dto: CreateUserDto) {
    return this.authService.createUser(dto);
  }

  @Post('create-agent')
  async createAgent(@Body() dto: CreateAgentDto) {
    return this.authService.createAgent(dto);
  }

  @Post('update-user')
  async updateUser(@Body() dto: UpdateUserDto) {
    return this.authService.updateUser(dto);
  }

}