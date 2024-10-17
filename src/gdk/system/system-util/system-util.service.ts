import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { MethodLogger } from '@shared/winston-logger';
import appConfig from 'src/app.config';

@Injectable()
export class SystemUtilService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
  ) {}

  @MethodLogger()
  public getPublicEnv() {
    return {
      APP_NAME: this.appEnvConfig.APP_NAME,
      STAGE: this.appEnvConfig.STAGE,
      PORT: this.appEnvConfig.PORT,
      DISABLE_ERROR_META: this.appEnvConfig.DISABLE_ERROR_META,
      ENABLE_SWAGGER: this.appEnvConfig.ENABLE_SWAGGER,
      LOG_LEVEL: this.appEnvConfig.LOG_LEVEL,
    };
  }
}
