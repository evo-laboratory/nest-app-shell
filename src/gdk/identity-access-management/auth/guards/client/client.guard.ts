import ValidateClient from '@gdk-iam/auth/helpers/validate-client';
import { SystemService } from '@gdk-system/system.service';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { WINSTON_LOG_VARIANT_LEVEL } from '@shared/winston-logger';
import appConfig from 'src/app.config';

@Injectable()
export class ClientGuard implements CanActivate {
  private readonly Logger = new Logger(ClientGuard.name);
  constructor(
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
    private readonly sys: SystemService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const clientMap = await this.sys.getClientMapFromCache();
    if (clientMap.size === 0) {
      this.Logger.log(`No Clients required`, {
        level: WINSTON_LOG_VARIANT_LEVEL.INFO,
        methodName: 'canActivate',
      });
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const inboundClientId = request.headers[this.appEnvConfig.CLIENT_KEY_NAME];
    if (!inboundClientId) {
      this.Logger.log(`Client required`, {
        level: WINSTON_LOG_VARIANT_LEVEL.INFO,
        methodName: 'canActivate',
      });
      return false;
    }
    const inboundClient = clientMap.get(inboundClientId);
    if (!inboundClient) {
      this.Logger.log(`No client match id ${inboundClientId}`, {
        level: WINSTON_LOG_VARIANT_LEVEL.INFO,
        methodName: 'canActivate',
      });
      return false;
    }
    return ValidateClient(inboundClient);
  }
}
