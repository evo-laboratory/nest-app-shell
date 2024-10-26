import { IsEnum, IsString } from 'class-validator';
import { IAuthSignOut } from '../types';
import { AUTH_TOKEN_TYPE } from '../enums';

export class AuthSignOutDto implements IAuthSignOut {
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  type: AUTH_TOKEN_TYPE;
  @IsString()
  token: string;
}
