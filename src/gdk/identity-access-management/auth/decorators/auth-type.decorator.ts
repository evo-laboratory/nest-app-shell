import { SetMetadata } from '@nestjs/common';
import { AUTH_TYPE } from '../enums';

export const AUTH_TYPE_KEY = 'authType';
export const AuthType = (...authTypes: AUTH_TYPE[]) =>
  SetMetadata(AUTH_TYPE_KEY, authTypes);
