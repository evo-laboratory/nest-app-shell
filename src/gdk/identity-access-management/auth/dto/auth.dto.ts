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
import { ApiProperty } from '@nestjs/swagger';
import { AuthTokenItemDto } from './auth-token-item.dto';
import { AuthSignInFailedRecordItemDto } from './auth-sign-in-failed-record-item.dto';

export class AuthDto implements IAuth {
  @ApiProperty({ type: String })
  _id?: string | Types.ObjectId;
  identifier: string;
  identifierType: AUTH_IDENTIFIER_TYPE;
  provider: AUTH_PROVIDER;
  signUpMethodList: AUTH_METHOD[];
  googleSignInId: string;
  @ApiProperty({ type: String })
  userId: Types.ObjectId | IUser;
  password: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  codeExpiredAt: number;
  @ApiProperty({ type: [AuthTokenItemDto] })
  activeRefreshTokenList: IAuthTokenItem[];
  @ApiProperty({ type: [AuthTokenItemDto] })
  accessTokenHistoryList: IAuthTokenItem[];
  @ApiProperty({ type: [AuthSignInFailedRecordItemDto] })
  signInFailRecordList: IAuthSignInFailedRecordItem[];
  isIdentifierVerified: boolean;
  isActive: boolean;
  inactiveAt: number;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number;
  lastChangedPasswordAt: number;
}
