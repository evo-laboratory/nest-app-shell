import { Injectable } from '@nestjs/common';
import { EmailSignUpDto, AuthVerifyDto, AuthEmailVerificationDto } from './dto';
import {
  IEmailSignUpRes,
  IAuthVerifyRes,
  IAuthEmailVerificationRes,
} from './types';
import { AuthEmailSignInDto } from './dto/auth-email-sign-in.dto';
import { IAuthSignInRes } from './types/auth.sign-in-response.interface';
@Injectable()
export abstract class AuthService {
  abstract emailSignUp(dto: EmailSignUpDto): Promise<IEmailSignUpRes>;
  abstract verifyAuth(dto: AuthVerifyDto): Promise<IAuthVerifyRes>;
  abstract emailVerification(
    dto: AuthEmailVerificationDto,
  ): Promise<IAuthEmailVerificationRes>;
  abstract emailSignIn(dto: AuthEmailSignInDto): Promise<IAuthSignInRes>;
  abstract signOut(): void;
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
