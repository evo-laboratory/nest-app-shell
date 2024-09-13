import { Module } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemController } from './system.controller';
import { SystemMongooseService } from './providers/system.mongoose/system.mongoose.service';
import { MongooseModule } from '@nestjs/mongoose';
import { SystemModel } from './providers/system.mongoose/system.schema';
import { RoleModel } from './providers/system.mongoose/role.schema';
import { HttpEndpointModel } from './providers/system.mongoose/http-endpoint.schema';

@Module({
  imports: [
    MongooseModule.forFeature([SystemModel, RoleModel, HttpEndpointModel]),
  ],
  providers: [
    {
      provide: SystemService,
      useClass: SystemMongooseService,
    },
  ],
  controllers: [SystemController],
})
export class SystemModule {}
