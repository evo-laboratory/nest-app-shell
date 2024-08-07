import { IAuthSignInRes } from '../types/auth.sign-in-response.interface';

export class AuthSignInRes implements IAuthSignInRes {
  accessToken: string;
  refreshToken: string;
}
