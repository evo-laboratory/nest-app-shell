import { IsEnum, IsString } from 'class-validator';
import { IAuthCheckRefreshToken } from '../types';
import { AUTH_TOKEN_TYPE } from '../enums';

export class AuthCheckRefreshTokenDto implements IAuthCheckRefreshToken {
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  type: AUTH_TOKEN_TYPE;
  @IsString()
  token: string;
}
