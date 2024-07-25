import { Types } from 'mongoose';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_PROVIDER,
  AUTH_SIGN_UP_METHOD,
  IAuthTokenItem,
} from '.';
import { IUser } from '@gdk-iam/user/types/user.interface';

export interface IAuth {
  identifier: string;
  identifierType: AUTH_IDENTIFIER_TYPE;
  provider: AUTH_PROVIDER;
  signUpMethodList: AUTH_SIGN_UP_METHOD[];
  userId: Types.ObjectId | IUser;
  password: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  codeExpiredAt: number;
  activeRefreshTokenList: IAuthTokenItem[];
  accessTokenHistoryList: IAuthTokenItem[]; // * Only tracks latest 1000
  isIdentifierVerified: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number;
  lastChangedPasswordAt: number;
}
