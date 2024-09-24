import ValidateClient from '@gdk-iam/auth/helpers/validate-client';
import { SystemService } from '@gdk-system/system.service';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import WinstonLogger from '@shared/winston-logger/winston.logger';
import appConfig from 'src/app.config';

@Injectable()
export class ClientGuard implements CanActivate {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
    private readonly sys: SystemService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const clientMap = await this.sys.getClientMapFromCache();
    if (clientMap.size === 0) {
      WinstonLogger.info(`No Clients required`, {
        contextName: ClientGuard.name,
        methodName: 'canActivate',
      });
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const inboundClientId = request.headers[this.appEnvConfig.CLIENT_KEY_NAME];
    if (!inboundClientId) {
      WinstonLogger.info(`Client required`, {
        contextName: ClientGuard.name,
        methodName: 'canActivate',
      });
      return false;
    }
    const inboundClient = clientMap.get(inboundClientId);
    if (!inboundClient) {
      WinstonLogger.info(`No client match id ${inboundClientId}`, {
        contextName: ClientGuard.name,
        methodName: 'canActivate',
      });
      return false;
    }
    return ValidateClient(inboundClient);
  }
}
