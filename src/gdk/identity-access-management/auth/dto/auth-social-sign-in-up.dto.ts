import { IsString, IsEnum } from 'class-validator';
import { IAuthSocialSignInUp } from '../types';
import { AUTH_METHOD } from '../enums';

export class AuthSocialSignInUpDto implements IAuthSocialSignInUp {
  @IsString()
  @IsEnum(AUTH_METHOD)
  method: AUTH_METHOD;
  @IsString()
  token: string;
}
