import { AUTH_CODE_USAGE } from './auth-code-usage.enum';

export interface IAuthVerify {
  identifier: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  newPassword?: string; // * When codeUsage is CHANGE_PASSWORD
}

export interface IAuthVerifyRes {
  isVerified: true;
}
