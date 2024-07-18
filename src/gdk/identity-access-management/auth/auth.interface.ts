import { IUser } from '../user/user.interface';
import { AUTH_CODE_USAGE, AUTH_PROVIDER } from './enums';
import { Types } from 'mongoose';
export interface IAuhActiveRefreshTokenItem {
  tokenId: string;
  issuer: string;
  expiredAt: number;
  createdAt: number;
}

export interface IAuth {
  provider: AUTH_PROVIDER;
  codeUsage: AUTH_CODE_USAGE;
  userId: Types.ObjectId | IUser;
  password: string;
  codeExpiredAt: number;
  activeTokenList: IAuhActiveRefreshTokenItem[];
}
