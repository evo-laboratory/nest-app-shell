import { AUTH_PROVIDER, AUTH_TOKEN_TYPE } from '@gdk-iam/auth/types';
import { IAuthTokenItem } from '../types';

export class AuthTokenItemDto implements IAuthTokenItem {
  type: AUTH_TOKEN_TYPE;
  provider: AUTH_PROVIDER;
  tokenId: string;
  tokenContent: string;
  issuer: string;
  expiredAt: number;
  createdAt: number;
}