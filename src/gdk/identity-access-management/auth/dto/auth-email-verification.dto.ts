import { IsEmail, IsEnum, IsString } from 'class-validator';
import { IAuthEmailVerification } from '../types/auth.email-verification';
import { IAuthEmailVerificationRes } from '../types/auth-email-verification.interface';
import { AUTH_CODE_USAGE } from '../enums';

export class AuthEmailVerificationDto implements IAuthEmailVerification {
  @IsString()
  @IsEmail()
  email: string;
  @IsEnum(AUTH_CODE_USAGE)
  usage: AUTH_CODE_USAGE;
}

export class AuthEmailVerificationRes implements IAuthEmailVerificationRes {
  isDone: boolean;
}
