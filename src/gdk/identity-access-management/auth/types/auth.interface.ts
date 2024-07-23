import { Types } from 'mongoose';
import { AUTH_CODE_USAGE, AUTH_PROVIDER } from '.';
import { IUser } from '@gdk-iam/user/types/user.interface';
import { IAuthTokenItem } from './auth-token-item.interface';
import { AUTH_SIGN_UP_METHOD } from './auth-sign-up-method.enum';

export interface IAuth {
  provider: AUTH_PROVIDER;
  signUpMethodList: AUTH_SIGN_UP_METHOD[];
  userId: Types.ObjectId | IUser;
  password: string;
  codeUsage: AUTH_CODE_USAGE;
  codeExpiredAt: number;
  activeRefreshTokenList: IAuthTokenItem[];
  accessTokenHistoryList: IAuthTokenItem[]; // * Only tracks latest 1000
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number;
}
