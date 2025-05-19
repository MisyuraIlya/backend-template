import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { ErpManager } from 'src/erp/erp.manager';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule, 
    JwtModule,
    UserModule
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    ErpManager,
    LocalStrategy, 
    JwtStrategy, 
    JwtRefreshStrategy, 
  ],
  exports: [AuthService]
})
export class AuthModule {}
