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
  AuthRevokeRefreshTokenDto,
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
  IAuthDecodedToken,
} from './types';
import { IGetResponseWrapper } from '@shared/types';
import { GetListOptionsDto, GetOptionsDto } from '@shared/dto';
import { IAuthRevokedRefreshTokenRes } from './types/auth-revoked-refresh-token-response.interface';

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
    verifiedToken: IAuthDecodedToken,
    dto: AuthSignOutDto,
  ): Promise<IAuthSignOutRes>;
  abstract getAuthById(): void;
  abstract getAuthByEmail(): void;
  abstract listAll(
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IAuth[]>>;
  abstract getById(
    id: string,
    dto: GetOptionsDto,
    canBeNull: boolean,
  ): Promise<IGetResponseWrapper<IAuth>>;
  abstract revokeRefreshToken(
    verifiedToken: IAuthDecodedToken,
    dto: AuthRevokeRefreshTokenDto,
  ): Promise<IAuthRevokedRefreshTokenRes>;
  abstract enable(): void;
  abstract disable(): void;
}
