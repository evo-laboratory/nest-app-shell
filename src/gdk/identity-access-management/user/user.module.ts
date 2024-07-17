import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserMongooseService } from './providers/user.mongoose/user.mongoose.service';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: UserService,
      useClass: UserMongooseService,
    },
  ],
})
export class UserModule {}
