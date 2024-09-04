import { VERIFIED_JWT_KEY } from '@gdk-iam/auth-jwt/auth-jwt.static';
import identityAccessManagementConfig from '@gdk-iam/identity-access-management.config';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import { IAuthDecodedToken } from '@gdk-iam/auth/types';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    @Inject(identityAccessManagementConfig.KEY)
    private readonly iamConfig: ConfigType<
      typeof identityAccessManagementConfig
    >,
    private readonly jwtService: JwtService,
  ) {}

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
      const payload = await this.jwtService.verifyAsync<IAuthDecodedToken>(
        token,
        {
          secret: this.iamConfig.JWT_SECRET,
          issuer: this.iamConfig.JWT_ISSUER,
          audience: this.iamConfig.JWT_AUDIENCE,
        },
      );
      req[VERIFIED_JWT_KEY] = payload;
      WinstonLogger.info('Token verified', {
        contextName: AccessTokenGuard.name,
        methodName: 'canActivate',
      });
    } catch {
      WinstonLogger.error('Verify failed', {
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
