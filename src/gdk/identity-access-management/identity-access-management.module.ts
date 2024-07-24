import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel } from './user/providers/user.mongoose/user.schema';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserMongooseService } from './user/providers/user.mongoose/user.mongoose.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthMongooseService } from './auth/providers/auth.mongoose/auth.mongoose.service';
import { AuthModel } from './auth/providers/auth.mongoose/auth.schema';
import { EncryptService } from './encrypt/encrypt.service';
import { MailModule } from '@gdk-mail/mail.module';

@Module({
  imports: [MailModule, MongooseModule.forFeature([UserModel, AuthModel])],
  controllers: [UserController, AuthController],
  providers: [
    {
      provide: UserService,
      useClass: UserMongooseService,
    },
    {
      provide: AuthService,
      useClass: AuthMongooseService,
    },
    EncryptService,
  ],
})
export class IdentityAccessManagementModule {}
