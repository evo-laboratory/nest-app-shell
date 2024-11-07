import { IsEmail, IsString, MinLength } from 'class-validator';
import { IEmailSignUp, IEmailSignUpRes } from '../types/email-signup.interface';
import { AUTH_PROVIDER } from '../enums';

export class EmailSignUpDto implements IEmailSignUp {
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(6)
  password: string;
  @IsString()
  firstName: string;
  @IsString()
  lastName: string;
  @IsString()
  displayName: string;
}

export class EmailSignUpRes implements IEmailSignUpRes {
  email: string;
  isEmailSent: boolean;
  canResendAt: Date;
  provider: AUTH_PROVIDER;
}
