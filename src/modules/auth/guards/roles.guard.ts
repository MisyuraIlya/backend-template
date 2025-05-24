import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator';
import { UsersTypes } from 'src/modules/user/enums/UsersTypes';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UsersTypes[]>(
      ROLES_KEY,
      [ ctx.getHandler(), ctx.getClass() ],
    );
    if (!required) return true;

    const req = ctx.switchToHttp().getRequest();
    const user = req.user;
    if (!user || !required.includes(user.role)) {
      throw new ForbiddenException('Admin privileges required');
    }
    return true;
  }
}
