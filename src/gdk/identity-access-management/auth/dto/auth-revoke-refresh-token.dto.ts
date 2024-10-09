import { AUTH_TOKEN_TYPE, IAuthRevokeToken } from '../types';

export class AuthRevokeRefreshTokenDto implements IAuthRevokeToken {
  type: AUTH_TOKEN_TYPE;
  token: string;
}
