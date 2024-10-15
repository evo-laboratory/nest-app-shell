import { Types } from 'mongoose';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_PROVIDER,
  AUTH_METHOD,
  IAuthSignInFailedRecordItem,
} from '.';
import { IUser } from '@gdk-iam/user/types';

export interface IAuth<
  UserIdT extends IUser | Types.ObjectId = Types.ObjectId,
> {
  _id?: Types.ObjectId;
  identifier: string;
  identifierType: AUTH_IDENTIFIER_TYPE;
  provider: AUTH_PROVIDER;
  signUpMethodList: AUTH_METHOD[];
  googleSignInId: string;
  userId: UserIdT | null;
  password: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  codeExpiredAt: number;
  signInFailRecordList: IAuthSignInFailedRecordItem[]; // * Only tracks latest 100
  isIdentifierVerified: boolean;
  isActive: boolean;
  inactiveAt: number;
  createdAt: number;
  updatedAt: number;
  lastChangedPasswordAt: number;
}
