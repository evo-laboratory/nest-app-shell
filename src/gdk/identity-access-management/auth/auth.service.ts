import { Injectable } from '@nestjs/common';
import { EmailSignUpDto, AuthVerifyDto, AuthEmailVerificationDto } from './dto';
import { IEmailSignUpRes, IAuthVerifyRes } from './types';
@Injectable()
export abstract class AuthService {
  abstract emailSignUp(dto: EmailSignUpDto): Promise<IEmailSignUpRes>;
  abstract verifyAuth(dto: AuthVerifyDto): Promise<IAuthVerifyRes>;
  abstract emailVerification(dto: AuthEmailVerificationDto): Promise<any>;
  abstract emailPasswordSignIn(): void;
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
