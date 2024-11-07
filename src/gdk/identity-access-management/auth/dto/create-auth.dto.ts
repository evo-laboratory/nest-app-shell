import { Types } from 'mongoose';
import { ICreateAuth } from '../types/create-auth.interface';
import { IsArray, IsEnum, IsString, MinLength } from 'class-validator';
import {
  AUTH_CODE_USAGE,
  AUTH_IDENTIFIER_TYPE,
  AUTH_METHOD,
  AUTH_PROVIDER,
} from '../enums';

export class CreateAuthDto implements ICreateAuth {
  @IsString()
  identifier: string;
  @IsEnum(AUTH_IDENTIFIER_TYPE)
  identifierType: AUTH_IDENTIFIER_TYPE;
  @IsArray()
  signUpMethodList: AUTH_METHOD[];
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
