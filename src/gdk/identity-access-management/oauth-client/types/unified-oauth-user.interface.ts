import { AUTH_METHOD } from '@gdk-iam/auth/types';

export interface IUnifiedOAuthUser {
  aud: string;
  sourceAuthMethod: AUTH_METHOD;
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarURL: string;
}
