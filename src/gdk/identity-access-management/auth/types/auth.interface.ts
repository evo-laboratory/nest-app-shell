import { Types } from 'mongoose';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_PROVIDER,
  AUTH_METHOD,
  IAuthTokenItem,
  IAuthSignInFailedRecordItem,
} from '.';

export interface IAuth<UserIdT = Types.ObjectId> {
  _id?: Types.ObjectId;
  identifier: string;
  identifierType: AUTH_IDENTIFIER_TYPE;
  provider: AUTH_PROVIDER;
  signUpMethodList: AUTH_METHOD[];
  googleSignInId: string;
  userId: UserIdT;
  password: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  codeExpiredAt: number;
  activeRefreshTokenList: IAuthTokenItem[];
  accessTokenHistoryList: IAuthTokenItem[]; // * Only tracks latest 100
  signInFailRecordList: IAuthSignInFailedRecordItem[]; // * Only tracks latest 100
  isIdentifierVerified: boolean;
  isActive: boolean;
  inactiveAt: number;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number;
  lastChangedPasswordAt: number;
}
