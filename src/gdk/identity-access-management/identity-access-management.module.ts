import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailModule } from '@gdk-mail/mail.module';
import { SystemModule } from '@gdk-system/system.module';

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

import { AuthRevokedTokenModel } from './auth-revoked-token/providers/auth-revoked-token.mongoose/auth-revoked-token.schema';
import { AccessTokenGuard } from './auth-jwt/guards/access-token/access-token.guard';

import { AuthenticationGuard } from './auth/guards/authentication/authentication.guard';
import { AuthRevokedTokenService } from './auth-revoked-token/auth-revoked-token.service';
import { AuthRevokedTokenMongooseService } from './auth-revoked-token/providers/auth-revoked-token.mongoose/auth-revoked-token.mongoose.service';
import { AuthorizationGuard } from './auth/guards/authorization/authorization.guard';
import { ClientGuard } from './auth/guards/client/client.guard';
import { OauthClientService } from './oauth-client/oauth-client.service';

import appConfig from 'src/app.config';
import identityAccessManagementConfig from './identity-access-management.config';
@Module({
  imports: [
    ConfigModule.forFeature(identityAccessManagementConfig),
    ConfigModule.forFeature(appConfig),
    MailModule,
    SystemModule,
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
      provide: AuthRevokedTokenService,
      useClass: AuthRevokedTokenMongooseService,
    },
    {
      provide: APP_GUARD,
      useClass: ClientGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
    AccessTokenGuard,
    EncryptService,
    AuthUtilService,
    AuthJwtService,
    JwtService,
    ConfigService,
    OauthClientService,
  ],
  controllers: [UserController, AuthController],
})
export class IdentityAccessManagementModule {}
