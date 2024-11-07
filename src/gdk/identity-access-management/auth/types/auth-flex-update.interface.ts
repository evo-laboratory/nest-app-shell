export interface IAuthFlexUpdate {
  googleSignInId?: string;
  codeExpiredAt?: Date;
  code?: string;
  codeUsage?: string;
  isIdentifierVerified?: boolean;
  password?: string;
  lastChangedPasswordAt?: Date;
  updatedAt?: Date;
}
