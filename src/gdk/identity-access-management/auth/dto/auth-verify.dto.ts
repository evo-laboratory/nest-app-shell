import {
  IsEnum,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { IAuthVerify, IAuthVerifyRes } from '../types/auth-verify.interface';
import { AUTH_CODE_USAGE } from '../enums';

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
