import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MethodLogger } from '@shared/winston-logger';
import SwaggerDocumentBuilder from '@shared/swagger/swagger-document-builder';
import appConfig from './app.config';
import { AppModule } from './app.module';
@Injectable()
export class AppService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appEnvConfig: ConfigType<typeof appConfig>,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  @MethodLogger()
  public getPublicEnv() {
    return {
      APP_NAME: this.appEnvConfig.APP_NAME,
      STAGE: this.appEnvConfig.STAGE,
      PORT: this.appEnvConfig.PORT,
      DISABLE_ERROR_META: this.appEnvConfig.DISABLE_ERROR_META,
      ENABLE_SWAGGER: this.appEnvConfig.ENABLE_SWAGGER,
      MONGO_DB_NAME: this.appEnvConfig.MONGO_DB_NAME,
    };
  }

  @MethodLogger()
  public async getSwaggerJson() {
    const app = await NestFactory.create(AppModule);
    const document = SwaggerDocumentBuilder(app);
    return document;
  }
}
