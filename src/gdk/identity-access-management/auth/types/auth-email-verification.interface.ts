import { AUTH_CODE_USAGE } from '../enums';

export interface IAuthEmailVerification {
  email: string;
  usage: AUTH_CODE_USAGE; // * Only allows SIGN_UP_VERIFY and FORGOT_PASSWORD
}

export interface IAuthEmailVerificationRes {
  isDone: boolean;
}
