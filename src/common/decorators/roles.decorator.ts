import { SetMetadata } from '@nestjs/common';
import { UsersTypes } from 'src/modules/user/enums/UsersTypes';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UsersTypes[]) =>
  SetMetadata(ROLES_KEY, roles);

export const Admin = () => Roles(UsersTypes.ADMIN);
