import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import appConfig from './app.config';
@Injectable()
export class AppService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  public getPublicEnv() {
    return {
      APP_NAME: this.appEnvConfig.APP_NAME,
      STAGE: this.appEnvConfig.STAGE,
      PORT: this.appEnvConfig.PORT,
      DISABLE_ERROR_META: this.appEnvConfig.DISABLE_ERROR_META,
      MONGO_DB_NAME: this.appEnvConfig.MONGO_DB_NAME,
    };
  }
}
