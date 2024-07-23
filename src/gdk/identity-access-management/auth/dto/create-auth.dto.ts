import { Types } from 'mongoose';
import { AUTH_PROVIDER, AUTH_CODE_USAGE } from '../types';
import { ICreateAuth } from '../types/create-auth.interface';
import { IsEnum, IsString, MinLength } from 'class-validator';

export class CreateAuthDto implements ICreateAuth {
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
