import { SystemService } from '@gdk-system/system.service';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Observable } from 'rxjs';
import appConfig from 'src/app.config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
    private readonly sys: SystemService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // TODO Check if sys has set client
    // TODO If client is empty, true
    // TODO Access key name from .env
    // TODO If has any client, check if match id from headers.access-key and process IClient settings
    return true;
  }
}
