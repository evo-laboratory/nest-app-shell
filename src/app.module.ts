import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpLoggerMiddleware } from '@shared/middlewares/http-logger.middleware';
import { IdentityAccessManagementModule } from '@gdk-iam/identity-access-management.module';
import { MailModule } from '@gdk-mail/mail.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EnvironmentConfigSchema } from './environment-config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: EnvironmentConfigSchema,
    }),
    MongooseModule.forRoot(
      `${process.env.MONGO_URI || 'mongodb://localhost:27017?replicaSet=rs'}`,
      {
        autoCreate: true,
        dbName: `${process.env.MONGO_DB_NAME || 'nest-shell-app'}`,
      },
    ),
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
