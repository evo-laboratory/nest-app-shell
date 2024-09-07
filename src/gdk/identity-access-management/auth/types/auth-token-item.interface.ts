import { AUTH_PROVIDER } from './auth-provider.enum';
import { AUTH_TOKEN_TYPE } from './auth-token-type.enum';

export interface IAuthTokenItem {
  type: AUTH_TOKEN_TYPE;
  provider: AUTH_PROVIDER;
  tokenId: string;
  tokenContent: string;
  issuer: string;
  expiredAt: number;
  createdAt: number;
}
