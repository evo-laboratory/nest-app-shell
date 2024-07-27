import { Injectable } from '@nestjs/common';
import { EmailSignUpDto, AuthVerifyDto, AuthEmailVerificationDto } from './dto';
import { IEmailSignUpRes, IAuthVerifyRes } from './types';
import { AuthEmailSignInDto } from './dto/auth-email-sign-in.dto';
@Injectable()
export abstract class AuthService {
  abstract emailSignUp(dto: EmailSignUpDto): Promise<IEmailSignUpRes>;
  abstract verifyAuth(dto: AuthVerifyDto): Promise<IAuthVerifyRes>;
  abstract emailVerification(dto: AuthEmailVerificationDto): Promise<any>;
  abstract emailSignIn(dto: AuthEmailSignInDto): Promise<any>;
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
