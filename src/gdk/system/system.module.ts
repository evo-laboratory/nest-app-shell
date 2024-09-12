import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemMongooseService } from './providers/system.mongoose/system.mongoose.service';

@Module({
  providers: [
    {
      provide: SystemService,
      useClass: SystemMongooseService,
    },
  ],
  controllers: [SystemController],
})
export class SystemModule {}
