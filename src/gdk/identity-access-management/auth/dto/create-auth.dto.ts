import { Types } from 'mongoose';
import { AUTH_PROVIDER, AUTH_CODE_USAGE } from '../types';
import { ICreateAuth } from '../types/create-auth.interface';
import { IsArray, IsEnum, IsString, MinLength } from 'class-validator';
import { AUTH_SIGN_UP_METHOD } from '../types/auth-sign-up-method.enum';
import { AUTH_IDENTIFIER_TYPE } from '../types/auth-identifier-type';

export class CreateAuthDto implements ICreateAuth {
  @IsString()
  identifier: string;
  @IsEnum(AUTH_IDENTIFIER_TYPE)
  identifierType: AUTH_IDENTIFIER_TYPE;
  @IsArray()
  signUpMethodList: AUTH_SIGN_UP_METHOD[];
  @IsEnum(AUTH_PROVIDER)
  provider: AUTH_PROVIDER;
  @IsString()
  @MinLength(6)
  password: string;
  @IsString()
  userId: Types.ObjectId;
  @IsEnum(AUTH_CODE_USAGE)
  codeUsage: AUTH_CODE_USAGE;
}
