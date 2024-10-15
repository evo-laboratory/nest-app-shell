import { Types } from 'mongoose';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_METHOD,
  AUTH_PROVIDER,
  IAuth,
  IAuthSignInFailedRecordItem,
} from '../types';
import { ApiProperty } from '@nestjs/swagger';
import { AuthSignInFailedRecordItemDto } from './auth-sign-in-failed-record-item.dto';
import { UserIdRefDto } from '@gdk-iam/user/dto';
import { MongoObjectIdDtoRef } from '@shared/swagger';

export class AuthDto implements IAuth {
  @ApiProperty({ type: String })
  _id?: Types.ObjectId;
  identifier: string;
  identifierType: AUTH_IDENTIFIER_TYPE;
  provider: AUTH_PROVIDER;
  signUpMethodList: AUTH_METHOD[];
  googleSignInId: string;
  @ApiProperty({
    oneOf: UserIdRefDto,
  })
  userId: Types.ObjectId;
  password: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  codeExpiredAt: number;
  @ApiProperty({ type: [AuthSignInFailedRecordItemDto] })
  signInFailRecordList: IAuthSignInFailedRecordItem[];
  isIdentifierVerified: boolean;
  isActive: boolean;
  inactiveAt: number;
  createdAt: number;
  updatedAt: number;
  lastChangedPasswordAt: number;
}

export const AuthIdRefDto = MongoObjectIdDtoRef(AuthDto);
