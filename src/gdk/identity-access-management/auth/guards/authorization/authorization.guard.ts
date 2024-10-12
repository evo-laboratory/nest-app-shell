import { VERIFIED_JWT_KEY } from '@gdk-iam/auth-jwt/auth-jwt.static';
import { AUTH_TYPE_KEY, AUTHZ_TYPE_KEY } from '@gdk-iam/auth/decorators';
import { AUTHZ_TYPE } from '@gdk-iam/auth/enums';
import { AUTH_TYPE, IAuthDecodedToken } from '@gdk-iam/auth/types';
import RolePermissionResolver from '@gdk-iam/user/helpers/role-permission-resolver';
import { SystemService } from '@gdk-system/system.service';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { PathToPermissionIdPath } from '@shared/helper';
import { WINSTON_LOG_VARIANT_LEVEL } from '@shared/winston-logger';
import appConfig from 'src/app.config';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly Logger = new Logger(AuthorizationGuard.name);
  constructor(
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
    private readonly reflector: Reflector,
    private readonly sys: SystemService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypes = this.reflector.getAllAndOverride<AUTH_TYPE[]>(
      AUTH_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AUTH_TYPE.BEARER];
    const authZTypes = this.reflector.getAllAndOverride<AUTHZ_TYPE[]>(
      AUTHZ_TYPE_KEY,
      [context.getHandler(), context.getClass()],
    ) ?? [AUTHZ_TYPE.ROLE];
    if (authTypes.length === 1 && authTypes[0] === AUTH_TYPE.PUBLIC) {
      this.Logger.log(
        `AuthTypes: ${AUTH_TYPE.PUBLIC} skipped Authz guarding.`,
        {
          level: WINSTON_LOG_VARIANT_LEVEL.INFO,
          methodName: 'canActivate',
        },
      );
      return true;
    }
    const req = context.switchToHttp().getRequest();
    const verifiedJwtPayload = req[VERIFIED_JWT_KEY] as IAuthDecodedToken;
    if (!verifiedJwtPayload) {
      this.Logger.log(`Cannot find verified jwt`, {
        level: WINSTON_LOG_VARIANT_LEVEL.INFO,
        methodName: 'canActivate',
      });
      return false;
    }
    if (this.appEnvConfig.SYS_OWNER_EMAIL) {
      if (verifiedJwtPayload.email === this.appEnvConfig.SYS_OWNER_EMAIL) {
        this.Logger.log(`Sys owner email verified`, {
          level: WINSTON_LOG_VARIANT_LEVEL.INFO,
          methodName: 'canActivate',
        });
        return true;
      }
    }
    if (
      verifiedJwtPayload.roleList.length === 0 &&
      authZTypes[0] === AUTHZ_TYPE.ROLE
    ) {
      this.Logger.log(`User not assigned any role`, {
        level: WINSTON_LOG_VARIANT_LEVEL.INFO,
        methodName: 'canActivate',
      });
      return false;
    }
    if (authZTypes[0] === AUTHZ_TYPE.USER) {
      this.Logger.log(`Authz type: ${AUTHZ_TYPE.USER}`, {
        level: WINSTON_LOG_VARIANT_LEVEL.INFO,
        methodName: 'canActivate',
      });
      return true;
    }
    const pathId = PathToPermissionIdPath(req.route.path);
    const permissionId = `${req.method.toUpperCase()}:${pathId}`.replace(
      /::([^:]+)$/,
      ':{$1}',
    );
    const userRoleMap = await this.sys.listRoleByNamesFromCache(
      verifiedJwtPayload.roleList,
    );
    this.Logger.log(`Use RolePermissionResolver: ${permissionId}`, {
      level: WINSTON_LOG_VARIANT_LEVEL.INFO,
      methodName: 'canActivate',
    });
    return RolePermissionResolver(userRoleMap, permissionId);
  }
}
