import { Injectable } from '@nestjs/common';
import {
  EmailSignUpDto,
  AuthVerifyDto,
  AuthEmailVerificationDto,
  AuthEmailSignInDto,
} from './dto';
import {
  IEmailSignUpRes,
  IAuthVerifyRes,
  IAuthEmailVerificationRes,
  IAuthSignInRes,
  IAuthSignOutRes,
} from './types';
import { AuthSignOutDto } from './dto/auth-sign-out.dto';

@Injectable()
export abstract class AuthService {
  abstract emailSignUp(dto: EmailSignUpDto): Promise<IEmailSignUpRes>;
  abstract verifyAuth(dto: AuthVerifyDto): Promise<IAuthVerifyRes>;
  abstract emailVerification(
    dto: AuthEmailVerificationDto,
  ): Promise<IAuthEmailVerificationRes>;
  abstract emailSignIn(dto: AuthEmailSignInDto): Promise<IAuthSignInRes>;
  abstract signOut(
    authId: string,
    dto: AuthSignOutDto,
  ): Promise<IAuthSignOutRes>;
  abstract createAuth(): void;
  abstract getAuthById(): void;
  abstract getAuthByEmail(): void;
  abstract list(): void;
  abstract updateById(): void;
  abstract createCustomToken(): void;
  abstract signInWithCustomToken(): void;
  abstract enable(): void;
  abstract disable(): void;
}
