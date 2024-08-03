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
import { EnvironmentConfigSchema } from './environment-config.schema';
import appConfig from './app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: EnvironmentConfigSchema,
      load: [appConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService) => ({
        uri: configService.get('MONGO_URI'),
        dbName: configService.get('MONGO_DB_NAME'),
        autoCreate: true,
      }),
    }),
    IdentityAccessManagementModule,
    MailModule,
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
