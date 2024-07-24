import { Injectable } from '@nestjs/common';
import { EmailSignUpDto } from './dto/email-signup.dto';
import { IEmailSignUpRes } from './types/email-signup.interface';
import { AuthVerifyDto } from './dto/auth-verify.dto';
import { IAuthVerifyRes } from './types/auth-verify.interface';

@Injectable()
export abstract class AuthService {
  abstract emailSignUp(dto: EmailSignUpDto): Promise<IEmailSignUpRes>;
  abstract verifyAuth(dto: AuthVerifyDto): Promise<IAuthVerifyRes>;
  abstract emailVerification(): void;
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
