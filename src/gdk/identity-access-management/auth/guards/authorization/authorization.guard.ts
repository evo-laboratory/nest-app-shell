import { VERIFIED_JWT_KEY } from '@gdk-iam/auth-jwt/auth-jwt.static';
import { AUTH_TYPE_KEY } from '@gdk-iam/auth/decorators';
import { AUTH_TYPE, IAuthDecodedToken } from '@gdk-iam/auth/types';
import { SystemService } from '@gdk-system/system.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sys: SystemService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AUTH_TYPE[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AUTH_TYPE.BEARER];
    if (authTypes.length === 1 && authTypes[0] === AUTH_TYPE.NONE) {
      WinstonLogger.info(
        `AuthTypes: ${AUTH_TYPE.NONE} skipped Authz guarding.`,
        {
          contextName: AuthorizationGuard.name,
          methodName: 'canActivate',
        },
      );
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const verifiedJwtPayload = req[VERIFIED_JWT_KEY] as IAuthDecodedToken;
    console.log(verifiedJwtPayload);
    if (!verifiedJwtPayload) {
      WinstonLogger.info(`Cannot find verified jwt`, {
        contextName: AuthorizationGuard.name,
        methodName: 'canActivate',
      });
      return false;
    }
    if (verifiedJwtPayload.roleList.length === 0) {
      WinstonLogger.info(`User not assigned any role`, {
        contextName: AuthorizationGuard.name,
        methodName: 'canActivate',
      });
      return false;
    }
    WinstonLogger.info('Authz Guarding ...', {
      contextName: AuthorizationGuard.name,
      methodName: 'canActivate',
    });
    return true;
  }
}