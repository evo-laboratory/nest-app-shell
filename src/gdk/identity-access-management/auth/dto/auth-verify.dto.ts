import {
  IsEnum,
  IsNotEmpty,
  IsNotIn,
  IsOptional,
  IsString,
  Length,
  MinLength,
} from 'class-validator';
import { IAuthVerify, IAuthVerifyRes } from '../types/auth-verify.interface';
import { AUTH_CODE_USAGE } from '../enums';

export class AuthVerifyDto implements IAuthVerify {
  @IsString()
  @IsNotEmpty()
  identifier: string;
  @IsString()
  @Length(6)
  code: string;
  @IsEnum(AUTH_CODE_USAGE)
  @IsNotIn([AUTH_CODE_USAGE.NOT_SET, AUTH_CODE_USAGE.FORGOT_PASSWORD])
  codeUsage: AUTH_CODE_USAGE;
  @IsOptional()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class AuthVerifyRes implements IAuthVerifyRes {
  isDone: boolean;
}
