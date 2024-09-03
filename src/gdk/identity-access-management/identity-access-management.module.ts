import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '@gdk-mail/mail.module';

import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { AuthMongooseService } from './auth/providers/auth.mongoose/auth.mongoose.service';
import { AuthModel } from './auth/providers/auth.mongoose/auth.schema';
import { AuthUtilService } from './auth-util/auth-util.service';
import { AuthJwtService } from './auth-jwt/auth-jwt.service';
import { EncryptService } from './encrypt/encrypt.service';

import { UserModel } from './user/providers/user.mongoose/user.schema';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { UserMongooseService } from './user/providers/user.mongoose/user.mongoose.service';

import identityAccessManagementConfig from './identity-access-management.config';
import { AuthRevokedTokenModel } from './auth-revoked-token/providers/auth-revoked-token.mongoose/auth-revoked-token.schema';
import { AccessTokenGuard } from './auth-jwt/guards/access-token/access-token.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forFeature(identityAccessManagementConfig),
    MailModule,
    MongooseModule.forFeature([UserModel, AuthModel, AuthRevokedTokenModel]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        audience: configService.get('JWT_AUDIENCE'),
        issuer: configService.get('JWT_ISSUER'),
        accessTokenTtl: configService.get('JWT_ACCESS_TOKEN_TTL'),
        signOptions: { expiresIn: configService.get('JWT_TOKEN_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [
    {
      provide: UserService,
      useClass: UserMongooseService,
    },
    {
      provide: AuthService,
      useClass: AuthMongooseService,
    },
    {
      provide: APP_GUARD,
      useClass: AccessTokenGuard,
    },
    EncryptService,
    AuthUtilService,
    AuthJwtService,
    JwtService,
    ConfigService,
  ],
  controllers: [UserController, AuthController],
})
export class IdentityAccessManagementModule {}
