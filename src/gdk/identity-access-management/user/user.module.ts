import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserMongooseService } from './providers/user.mongoose/user.mongoose.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from './providers/user.mongoose/user.schema';

@Module({
  imports: [MongooseModule.forFeature([UserModel])],
  controllers: [UserController],
  providers: [
    {
      provide: UserService,
      useClass: UserMongooseService,
    },
  ],
})
export class UserModule {}
