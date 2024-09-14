import { SetMetadata } from '@nestjs/common';
import { AUTHZ_TYPE } from '../enums';

export const AUTHZ_TYPE_KEY = 'authZType';
export const AuthZType = (...authZTypes: AUTHZ_TYPE[]) =>
  SetMetadata(AUTHZ_TYPE_KEY, authZTypes);
