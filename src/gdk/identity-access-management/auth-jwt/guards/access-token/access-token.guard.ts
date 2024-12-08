import { VERIFIED_JWT_KEY } from '@gdk-iam/auth-jwt/auth-jwt.static';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { IAuthDecodedToken } from '@gdk-iam/auth/types';
import { AuthJwtService } from '@gdk-iam/auth-jwt/auth-jwt.service';
import { WINSTON_LOG_VARIANT_LEVEL } from '@shared/winston-logger';
import { AUTH_TOKEN_TYPE } from '@gdk-iam/auth/enums';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  private readonly Logger = new Logger(AccessTokenGuard.name);
  constructor(private readonly authJWT: AuthJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(req);
    if (!token) {
      this.Logger.error('Token not found', 'canActivate');
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.authJWT.verify<IAuthDecodedToken>(
        token,
        AUTH_TOKEN_TYPE.ACCESS,
      );
      if (payload.isError) {
        this.Logger.error('Token verify failed', 'canActivate');
        throw new UnauthorizedException();
      }
      req[VERIFIED_JWT_KEY] = payload.decodedToken;
      this.Logger.log(`Token verified`, {
        level: WINSTON_LOG_VARIANT_LEVEL.INFO,
        methodName: 'canActivate',
      });
    } catch {
      this.Logger.error('Token verify failed', 'canActivate');
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
