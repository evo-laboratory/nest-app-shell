import { AUTH_PROVIDER, AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';
export interface IAuthTokenItem {
  type: AUTH_TOKEN_TYPE;
  provider: AUTH_PROVIDER;
  tokenId: string;
  tokenContent: string;
  issuer: string;
  expiredAt: number;
  createdAt: number;
}
