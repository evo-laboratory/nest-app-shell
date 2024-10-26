import { AUTH_PROVIDER } from '../enums';
export interface IEmailSignUp {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  displayName: string;
}

export interface IEmailSignUpRes {
  email: string;
  isEmailSent: boolean;
  canResendAt: number;
  provider: AUTH_PROVIDER;
}
