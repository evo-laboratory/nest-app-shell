import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccessTokenGuard } from '@gdk-iam/auth-jwt/guards/access-token/access-token.guard';
import { AUTH_TYPE_KEY } from '@gdk-iam/auth/decorators/auth-type.decorator';
import { AUTH_TYPE } from '@gdk-iam/auth/types';
import WinstonLogger from '@shared/winston-logger/winston.logger';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private static readonly defaultAuthType = AUTH_TYPE.BEARER;
  private readonly authTypeGuardMap: Record<AUTH_TYPE, CanActivate> = {
    [AUTH_TYPE.BEARER]: this.accessTokenGuard,
    [AUTH_TYPE.PUBLIC]: { canActivate: () => true },
  };

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AUTH_TYPE[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AuthenticationGuard.defaultAuthType];
    let error = new UnauthorizedException();
    const guards = authTypes.map((type) => this.authTypeGuardMap[type]).flat();
    WinstonLogger.info(`Authn types: ${authTypes.join(',')}`, {
      contextName: AuthenticationGuard.name,
      methodName: 'canActivate',
    });
    for (const instance of guards) {
      const canActivate = await Promise.resolve(
        instance.canActivate(context),
      ).catch((err) => {
        error = err;
      });

      if (canActivate) {
        return true;
      }
    }
    throw error;
  }
}
