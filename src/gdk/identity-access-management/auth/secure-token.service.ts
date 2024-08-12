import { Injectable } from '@nestjs/common';
import { IAuthRegisterToken } from './types';

@Injectable()
export abstract class SecureTokenService {
  abstract registerToken(authId: string, dto: IAuthRegisterToken): Promise<any>;
  abstract validateToken(authId: string, tokenId: string): Promise<boolean>;
  abstract invalidateToken(authId: string, tokenId: string): Promise<any>;
}
