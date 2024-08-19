import { IAuth } from '@gdk-iam/auth/types';
import { AUTH_REVOKED_TOKEN_SOURCE } from './auth-revoked-token-source.enum';
import { Types } from 'mongoose';

export interface IAuthRevokedToken {
  source: AUTH_REVOKED_TOKEN_SOURCE;
  authId: IAuth | Types.ObjectId;
  tokenId: string;
  revokedAt: number;
}
