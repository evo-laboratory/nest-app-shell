import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpLoggerMiddleware } from '@shared/middlewares/http-logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityAccessManagementModule } from './gdk/identity-access-management/identity-access-management.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `${process.env.MONGO_URI || 'mongodb://localhost:27017?replicaSet=rs'}`,
      {
        autoCreate: true,
        dbName: `${process.env.MONGO_DB_NAME || 'nest-shell-app'}`,
      },
    ),
    IdentityAccessManagementModule,
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
