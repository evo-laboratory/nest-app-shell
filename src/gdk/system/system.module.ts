import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';

import { SystemController } from './system.controller';
import { SystemService } from './system.service';

import { SystemMongooseService } from './providers/system.mongoose/system.mongoose.service';
import { SystemModel } from './providers/system.mongoose/system.schema';
import { ConfigModule } from '@nestjs/config';
import appConfig from 'src/app.config';

@Module({
  imports: [
    ConfigModule.forFeature(appConfig),
    CacheModule.register(),
    MongooseModule.forFeature([SystemModel]),
  ],
  providers: [
    {
      provide: SystemService,
      useClass: SystemMongooseService,
    },
  ],
  controllers: [SystemController],
  exports: [SystemService],
})
export class SystemModule {}
