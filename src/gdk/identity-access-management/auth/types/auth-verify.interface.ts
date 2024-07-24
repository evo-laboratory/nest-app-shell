import { AUTH_CODE_USAGE } from './auth-code-usage.enum';

export interface IAuthVerify {
  code: string;
  codeUsage: AUTH_CODE_USAGE;
  newPassword?: string; // * When codeUsage is CHANGE_PASSWORD
}
