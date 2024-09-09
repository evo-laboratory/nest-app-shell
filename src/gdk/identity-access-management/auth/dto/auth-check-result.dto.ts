import { IsBoolean, IsString } from 'class-validator';
import { IAuthCheckResult } from '../types';

export class AuthCheckResult implements IAuthCheckResult {
  @IsBoolean()
  isValid: boolean;
  @IsString()
  message: string;
}
