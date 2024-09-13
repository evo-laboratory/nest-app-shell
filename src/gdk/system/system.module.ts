import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemMongooseService } from './providers/system.mongoose/system.mongoose.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemModel } from './providers/system.mongoose/system.schema';

@Module({
  imports: [MongooseModule.forFeature([SystemModel])],
  providers: [
    {
      provide: SystemService,
      useClass: SystemMongooseService,
    },
  ],
  controllers: [SystemController],
})
export class SystemModule {}
