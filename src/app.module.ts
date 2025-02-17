import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpLoggerMiddleware } from '@shared/middlewares/http-logger.middleware';
import { IdentityAccessManagementModule } from '@gdk-iam/identity-access-management.module';
import { MailModule } from '@gdk-mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './app.config';

import { EnvironmentConfigSchema } from './environment-config.schema';
import { SystemModule } from './gdk/system/system.module';

const NODE_ENV = process.env.NODE_ENV
  ? `${process.env.NODE_ENV}`.toLowerCase()
  : 'dev';
@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `.env.${NODE_ENV}`,
      validationSchema: EnvironmentConfigSchema,
      load: [appConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService) => ({
        uri: configService.get('MONGO_URI'),
        dbName: configService.get('MONGO_DB_NAME'),
        autoCreate: true,
      }),
    }),
    IdentityAccessManagementModule,
    MailModule,
    SystemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(HttpLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
