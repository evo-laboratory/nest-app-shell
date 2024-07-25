import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { AUTH_CODE_USAGE } from '../types';
import { IAuthVerify, IAuthVerifyRes } from '../types/auth-verify.interface';

export class AuthVerifyDto implements IAuthVerify {
  @IsString()
  identifier: string;
  @IsString()
  @Length(6)
  code: string;
  @IsEnum(AUTH_CODE_USAGE)
  codeUsage: AUTH_CODE_USAGE;
  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class AuthVerifyRes implements IAuthVerifyRes {
  isDone: boolean;
}
