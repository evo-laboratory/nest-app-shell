import { AUTH_CODE_USAGE } from './auth-code-usage.enum';

export interface IAuthEmailVerification {
  email: string;
  usage: AUTH_CODE_USAGE; // * Only allows SIGN_UP_VERIFY and FORGOT_PASSWORD
}

export interface IAuthEmailVerificationRes {
  isDone: boolean;
}
