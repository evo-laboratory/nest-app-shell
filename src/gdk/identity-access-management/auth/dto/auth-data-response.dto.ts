import { ApiProperty } from '@nestjs/swagger';
import { IAuth } from '../types';
import { IAuthDataResponse } from '../types/auth-data-response.interface';
import { AuthDto } from './auth.dto';

export class AuthDataResponseDto implements IAuthDataResponse {
  @ApiProperty({ type: () => AuthDto })
  data: IAuth;
}
