import { AUTH_CODE_USAGE, AUTH_PROVIDER } from './enums';

export interface IAuhActiveRefreshTokenItem {
  tokenId: string;
  issuer: string;
  expiredAt: number;
  createdAt: number;
}

export interface IAuth {
  provider: AUTH_PROVIDER;
  codeUsage: AUTH_CODE_USAGE;
  userId: string;
  password: string;
  codeExpiredAt: number;
  activeTokenList: IAuhActiveRefreshTokenItem[];
}
