import { Types } from 'mongoose';
import { IUser } from '../user/user.interface';
import { AUTH_CODE_USAGE, AUTH_PROVIDER } from './enums';
export interface IAuhTokenItem {
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
  activeRefreshTokenList: IAuhTokenItem[];
  accessTokenHistoryList: IAuhTokenItem[]; // * Only tracks latest 100
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number;
}
