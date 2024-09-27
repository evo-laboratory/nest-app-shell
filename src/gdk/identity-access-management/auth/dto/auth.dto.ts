import { IUser } from '@gdk-iam/user/types';
import { Types } from 'mongoose';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_METHOD,
  AUTH_PROVIDER,
  IAuth,
  IAuthSignInFailedRecordItem,
  IAuthTokenItem,
} from '../types';

export class AuthDto implements IAuth {
  _id?: string | Types.ObjectId;
  identifier: string;
  identifierType: AUTH_IDENTIFIER_TYPE;
  provider: AUTH_PROVIDER;
  signUpMethodList: AUTH_METHOD[];
  googleSignInId: string;
  userId: Types.ObjectId | IUser;
  password: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  codeExpiredAt: number;
  activeRefreshTokenList: IAuthTokenItem[];
  accessTokenHistoryList: IAuthTokenItem[];
  signInFailRecordList: IAuthSignInFailedRecordItem[];
  isIdentifierVerified: boolean;
  isActive: boolean;
  inactiveAt: number;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number;
  lastChangedPasswordAt: number;
}
