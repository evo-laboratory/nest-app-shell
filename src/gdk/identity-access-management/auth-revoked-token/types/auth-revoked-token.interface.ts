import { Types } from 'mongoose';
import { IAuth } from '@gdk-iam/auth/types';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';

import { AUTH_REVOKED_TOKEN_SOURCE } from '../enums/auth-revoked-token-source.enum';
export interface IAuthRevokedToken {
  source: AUTH_REVOKED_TOKEN_SOURCE;
  type: AUTH_TOKEN_TYPE;
  authId: IAuth | Types.ObjectId;
  tokenId: string;
  revokedAt: number;
}
