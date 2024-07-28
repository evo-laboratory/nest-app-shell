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
import { AuthUtilService } from './auth-util/auth-util.service';
import { AuthJwtService } from './auth-jwt/auth-jwt.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MailModule,
    MongooseModule.forFeature([UserModel, AuthModel]),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_TOKEN_EXPIRES_IN || '60s' },
    }),
  ],
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
    AuthUtilService,
    AuthJwtService,
  ],
})
export class IdentityAccessManagementModule {
  constructor() {
    console.log(process.env.JWT_SECRET);
    console.log(process.env.JWT_TOKEN_EXPIRES_IN);
  }
}
