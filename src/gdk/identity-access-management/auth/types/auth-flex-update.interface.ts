export interface IAuthFlexUpdate {
  googleSignInId?: string;
  codeExpiredAt?: number;
  code?: string;
  codeUsage?: string;
  isIdentifierVerified?: boolean;
  password?: string;
  lastChangedPasswordAt?: number;
  updatedAt?: number;
}
