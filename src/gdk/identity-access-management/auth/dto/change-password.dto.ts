import { IsEnum, IsString, Length, MinLength } from 'class-validator';
import { AUTH_CODE_USAGE } from '../types';
import { IAuthVerify } from '../types/auth-verify.interface';

export class ChangePasswordDto implements IAuthVerify {
  @IsString()
  identifier: string;
  @IsString()
  @Length(6)
  code: string;
  @IsEnum(AUTH_CODE_USAGE)
  codeUsage: AUTH_CODE_USAGE;
  @IsString()
  @MinLength(6)
  newPassword: string;
}
