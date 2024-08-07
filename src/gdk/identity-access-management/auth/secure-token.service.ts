import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class SecureTokenService {
  abstract registerToken(dto: any): Promise<any>;
  abstract validateToken(dto: any): Promise<any>;
  abstract invalidateToken(dto: any): Promise<any>;
}
