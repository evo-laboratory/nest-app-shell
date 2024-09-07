import { VERIFIED_JWT_KEY } from '@gdk-iam/auth-jwt/auth-jwt.static';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import { AUTH_TOKEN_TYPE, IAuthDecodedToken } from '@gdk-iam/auth/types';
import { AuthJwtService } from '@gdk-iam/auth-jwt/auth-jwt.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly authJWT: AuthJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      WinstonLogger.error('Token not found', {
        contextName: AccessTokenGuard.name,
        methodName: 'canActivate',
      });
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.authJWT.verify<IAuthDecodedToken>(
        token,
        AUTH_TOKEN_TYPE.ACCESS,
      );
      req[VERIFIED_JWT_KEY] = payload;
      WinstonLogger.info('Token verified', {
        contextName: AccessTokenGuard.name,
        methodName: 'canActivate',
      });
    } catch {
      WinstonLogger.error('Token verify failed', {
        contextName: AccessTokenGuard.name,
        methodName: 'canActivate',
      });
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(req: Request): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, token] = req.headers.authorization?.split(' ') ?? [];
    return token;
  }
}
