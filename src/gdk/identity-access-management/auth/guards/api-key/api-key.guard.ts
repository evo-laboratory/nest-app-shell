import ValidateAPIKeyClient from '@gdk-iam/auth/helpers/validate-api-key-client';
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
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
    private readonly sys: SystemService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const clientMap = await this.sys.getClientMapFromCache();
    console.log(clientMap);
    const keys = Object.keys(clientMap);
    if (keys.length === 0) {
      WinstonLogger.info(`No Clients required`, {
        contextName: ApiKeyGuard.name,
        methodName: 'canActivate',
      });
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const inboundApiKey = request[this.appEnvConfig.API_KEY_NAME];
    if (!inboundApiKey) {
      WinstonLogger.info(`API key required`, {
        contextName: ApiKeyGuard.name,
        methodName: 'canActivate',
      });
      return false;
    }
    const inboundClient = clientMap[inboundApiKey];
    if (!inboundClient) {
      WinstonLogger.info(`No client match API key ${inboundApiKey}`, {
        contextName: ApiKeyGuard.name,
        methodName: 'canActivate',
      });
      return false;
    }
    return ValidateAPIKeyClient(inboundClient);
  }
}
