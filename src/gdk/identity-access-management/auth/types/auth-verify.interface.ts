import { AUTH_CODE_USAGE } from '../enums';

export interface IAuthVerify {
  identifier: string;
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  newPassword?: string; // * When codeUsage is CHANGE_PASSWORD
}

export interface IAuthVerifyRes {
  isDone: boolean;
}
