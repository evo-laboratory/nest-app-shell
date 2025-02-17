import { Injectable } from '@nestjs/common';
import { IGetResponseWrapper } from '@shared/types';
import { GetListOptionsDto, GetOptionsDto } from '@shared/dto';
import {
  EmailSignUpDto,
  AuthVerifyDto,
  AuthEmailVerificationDto,
  AuthEmailSignInDto,
  AuthCheckRefreshTokenDto,
  AuthExchangeNewAccessTokenDto,
  AuthSocialSignInUpDto,
  AuthBatchCreateDto,
} from './dto';
import {
  IEmailSignUpRes,
  IAuthVerifyRes,
  IAuthEmailVerificationRes,
  IAuthSignInRes,
  IAuthCheckResult,
  IAuthExchangeNewAccessTokenRes,
  IAuth,
  IAuthDataResponse,
} from './types';

@Injectable()
export abstract class AuthService {
  abstract batch(dto: AuthBatchCreateDto): Promise<any>;
  abstract emailSignUp(
    dto: EmailSignUpDto,
    isManualVerified: boolean,
  ): Promise<IEmailSignUpRes>;
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
  abstract listAll(
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IAuth[]>>;
  abstract listByIdentifiers(
    identifiers: string[],
    opt: GetListOptionsDto,
  ): Promise<IGetResponseWrapper<IAuth[]>>;
  abstract getById(
    id: string,
    dto: GetOptionsDto,
    canBeNull: boolean,
  ): Promise<IAuthDataResponse>;
  abstract getByEmail(
    email: string,
    dto: GetOptionsDto,
    canBeNull: boolean,
  ): Promise<IAuthDataResponse>;
  abstract getByIdentifier(
    identifier: string,
    dto: GetOptionsDto,
    canBeNull: boolean,
  ): Promise<IAuthDataResponse>;
  abstract activateById(id: string): Promise<IAuthDataResponse>;
  abstract deactivateById(id: string): Promise<IAuthDataResponse>;
  abstract deleteById(
    id: string,
    isSelfDelete: boolean,
  ): Promise<IAuthDataResponse>;
}
