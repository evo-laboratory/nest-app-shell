import { AUTH_CODE_USAGE } from './auth-code-usage.enum';

export const AUTH_MODEL_NAME = 'Auth';
export const AUTH_API = 'auth';

export const AUTH_TOKEN_ITEM_MODEL_NAME = 'AuthTokenItem';

export const EMAIL_SIGNUP_PATH = 'email-sign-up';
export const VERIFICATION_PATH = 'verification';
export const EMAIL_VERIFICATION_PATH = 'email-verification';

export const EMAIL_VERIFICATION_ALLOW_AUTH_USAGE = [
  AUTH_CODE_USAGE.FORGOT_PASSWORD,
  AUTH_CODE_USAGE.SIGN_UP_VERIFY,
];
