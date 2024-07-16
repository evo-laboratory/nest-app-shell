import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpLoggerMiddleware } from '@shared/middlewares/http-logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdentityAccessManagementModule } from './gdk/identity-access-management/identity-access-management.module';

@Module({
  imports: [ConfigModule.forRoot(), IdentityAccessManagementModule],
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
