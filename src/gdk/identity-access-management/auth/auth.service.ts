import { Injectable } from '@nestjs/common';
import { EmailSignUpDto } from './dto/email-signup.dto';

@Injectable()
export abstract class AuthService {
  abstract emailSignUp(dto: EmailSignUpDto): void;
  abstract verifyAuth(): void;
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
