import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ValidationDto } from './dto/validation.dto';
import { RestorePasswordStepOneDto } from './dto/restore-password-step-one.dto';
import { RestorePasswordStepTwoDto } from './dto/restore-password-step-two.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAgentDto } from './dto/create-agent.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseInterceptor } from 'src/common/interceptors/response.interceptor';

@Controller('auth')
@UseInterceptors(ResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('validation')
  async validate(@Body() dto: ValidationDto) {
    return this.authService.validate(dto);
  }

  @Post('registration')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('restore-password/step-one')
  async restoreStepOne(@Body() dto: RestorePasswordStepOneDto) {
    return this.authService.restorePasswordStepOne(dto);
  }

  @Post('restore-password/step-two')
  async restoreStepTwo(@Body() dto: RestorePasswordStepTwoDto) {
    return this.authService.restorePasswordStepTwo(dto);
  }

  @Post('create-user')
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