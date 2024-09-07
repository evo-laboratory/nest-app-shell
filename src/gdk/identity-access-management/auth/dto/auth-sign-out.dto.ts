import { IsString } from 'class-validator';
import { IAuthSignOut } from '../types';

export class AuthSignOutDto implements IAuthSignOut {
  @IsString()
  refreshToken: string;
}
