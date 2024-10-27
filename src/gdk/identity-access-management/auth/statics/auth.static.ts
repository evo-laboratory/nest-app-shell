import { AUTH_CODE_USAGE } from '../enums';

export const AUTH_API = 'auth';

export const AUTH_MODEL_NAME = 'Auth';
export const AUTH_TOKEN_ITEM_MODEL_NAME = 'AuthTokenItem';
export const AUTH_SIGN_IN_FAIL_RECORD_ITEM_MODEL_NAME =
  'AuthSignInFailRecordItem';
export const AUTH_ACTIVITIES_MODEL_NAME = 'AuthActivities';
export const EMAIL_SIGN_UP_PATH = 'email-sign-up';
export const EMAIL_PATH = 'email';
export const VERIFIED_EMAIL_SIGN_UP_PATH = 'verified-email-sign-up';
export const SOCIAL_SIGN_IN_UP_PATH = 'social-sign-in-up';
export const EMAIL_SIGN_IN_PATH = 'email-sign-in';
export const VERIFICATION_PATH = 'verification';
export const EMAIL_VERIFICATION_PATH = 'email-verification';
export const SIGN_OUT_PATH = 'sign-out';
export const REFRESH_TOKEN_PATH = 'refresh-token';
export const ACCESS_TOKEN_PATH = 'access-token';
export const REVOKE_REFRESH_TOKEN_PATH = 'revoke-refresh-token';

export const EMAIL_VERIFICATION_ALLOW_AUTH_USAGE = [
  AUTH_CODE_USAGE.FORGOT_PASSWORD,
  AUTH_CODE_USAGE.SIGN_UP_VERIFY,
];
