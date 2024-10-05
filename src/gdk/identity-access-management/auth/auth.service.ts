import { Injectable } from '@nestjs/common';
import {
  EmailSignUpDto,
  AuthVerifyDto,
  AuthEmailVerificationDto,
  AuthEmailSignInDto,
  AuthCheckRefreshTokenDto,
  AuthExchangeNewAccessTokenDto,
  AuthSignOutDto,
  AuthSocialSignInUpDto,
} from './dto';
import {
  IEmailSignUpRes,
  IAuthVerifyRes,
  IAuthEmailVerificationRes,
  IAuthSignInRes,
  IAuthSignOutRes,
  IAuthCheckResult,
  IAuthExchangeNewAccessTokenRes,
  IAuth,
} from './types';
import { IGetResponseWrapper } from '@shared/types';
import { GetListOptionsDto } from '@shared/dto';

@Injectable()
export abstract class AuthService {
  abstract emailSignUp(dto: EmailSignUpDto): Promise<IEmailSignUpRes>;
  abstract verifyAuth(dto: AuthVerifyDto): Promise<IAuthVerifyRes>;
  abstract emailVerification(
    dto: AuthEmailVerificationDto,
  ): Promise<IAuthEmailVerificationRes>;
  abstract emailSignIn(dto: AuthEmailSignInDto): Promise<IAuthSignInRes>;
  abstract socialEmailSignInUp(
    dto: AuthSocialSignInUpDto,
  ): Promise<IAuthSignInRes>;
  abstract verifyRefreshToken(
    dto: AuthCheckRefreshTokenDto,
    returnDecodedToken?: boolean,
  ): Promise<IAuthCheckResult>;
  abstract exchangeAccessToken(
    dto: AuthExchangeNewAccessTokenDto,
  ): Promise<IAuthExchangeNewAccessTokenRes>;
  abstract signOut(
    authId: string,
    dto: AuthSignOutDto,
  ): Promise<IAuthSignOutRes>;
  abstract getAuthById(): void;
  abstract getAuthByEmail(): void;
  abstract listAll(
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IAuth[]>>;
  abstract getById(
    id: string,
    canBeNull: boolean,
  ): Promise<IGetResponseWrapper<IAuth>>;
  abstract enable(): void;
  abstract disable(): void;
}
