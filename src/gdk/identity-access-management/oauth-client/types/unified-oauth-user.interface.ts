import { AUTH_METHOD } from '@gdk-iam/auth/enums';

export interface IUnifiedOAuthUser {
  aud: string;
  sourceAuthMethod: AUTH_METHOD;
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName: string;
  avatarURL: string;
  meta?: { [key: string]: any };
}
