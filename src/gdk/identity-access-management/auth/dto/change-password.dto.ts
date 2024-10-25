import { IsEnum, IsString, Length, MinLength } from 'class-validator';
import { IAuthVerify } from '../types/auth-verify.interface';
import { AUTH_CODE_USAGE } from '../enums';

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
