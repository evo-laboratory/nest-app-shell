import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
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
import { AuthRevokedTokenService } from './auth-revoked-token/auth-revoked-token.service';
import { RevokedTokenMongooseService } from './auth-revoked-token/providers/revoked-token.mongoose/revoked-token.mongoose.service';
import { RevokedTokenRedisService } from './auth-revoked-token/providers/revoked-token.redis/revoked-token.redis.service';

import identityAccessManagementConfig from './identity-access-management.config';

@Module({
  imports: [
    ConfigModule.forFeature(identityAccessManagementConfig),
    MailModule,
    MongooseModule.forFeature([UserModel, AuthModel]),
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
    AuthRevokedTokenService,
    RevokedTokenMongooseService,
    RevokedTokenRedisService,
  ],
})
export class IdentityAccessManagementModule {}
