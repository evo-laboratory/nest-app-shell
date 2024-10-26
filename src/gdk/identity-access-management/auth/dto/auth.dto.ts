import { Types } from 'mongoose';
import { AUTH_IDENTIFIER_TYPE, IAuth } from '../types';
import { ApiProperty } from '@nestjs/swagger';
import { UserIdRefDto } from '@gdk-iam/user/dto';
import { MongoObjectIdDtoRef } from '@shared/swagger';
import { AUTH_CODE_USAGE, AUTH_METHOD, AUTH_PROVIDER } from '../enums';

export class AuthDto implements IAuth {
  @ApiProperty({ type: String })
  _id?: Types.ObjectId;
  identifier: string;
  identifierType: AUTH_IDENTIFIER_TYPE;
  provider: AUTH_PROVIDER;
  signUpMethodList: AUTH_METHOD[];
  googleSignInId: string;
  appleSignInId: string;
  facebookSignId: string;
  githubSignId: string;
  gitlabSignId: string;
  microsoftSignId: string;
  @ApiProperty({
    oneOf: UserIdRefDto,
  })
  userId: Types.ObjectId;
  password: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  codeExpiredAt: Date;
  // @ApiProperty({ type: [AuthSignInFailedRecordItemDto] })
  // signInFailRecordList: IAuthSignInFailedRecordItem[];
  isIdentifierVerified: boolean;
  isActive: boolean;
  inactiveAt: number;
  createdAt: Date;
  updatedAt: Date;
  lastChangedPasswordAt: Date;
}

export const AuthIdRefDto = MongoObjectIdDtoRef(AuthDto);
