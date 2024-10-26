import { IsEnum, IsString } from 'class-validator';
import { IAuthExchangeNewAccessToken } from '../types';
import { AUTH_TOKEN_TYPE } from '../enums';

export class AuthExchangeNewAccessTokenDto
  implements IAuthExchangeNewAccessToken
{
  @IsString()
  @IsEnum(AUTH_TOKEN_TYPE)
  type: AUTH_TOKEN_TYPE;
  @IsString()
  token: string;
}
