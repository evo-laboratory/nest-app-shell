import { IsEmail, IsString, MinLength } from 'class-validator';
import { IEmailSignUp } from '../types/email-signup.interface';

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
