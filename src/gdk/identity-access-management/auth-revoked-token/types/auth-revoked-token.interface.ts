import { AUTH_REVOKED_TOKEN_SOURCE } from './auth-revoked-token-source.enum';

export interface IAuthRevokedToken {
  source: AUTH_REVOKED_TOKEN_SOURCE;
  authId: string;
  tokenId: string;
  revokedAt: number;
}
