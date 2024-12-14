import { IsEnum, IsNotIn, IsString } from 'class-validator';
import { IAuthSignOut } from '../types';
import { AUTH_TOKEN_TYPE } from '../enums';

export class AuthSignOutDto implements IAuthSignOut {
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  @IsNotIn([AUTH_TOKEN_TYPE.ACCESS])
  type: AUTH_TOKEN_TYPE;
  @IsString()
  token: string;
}
