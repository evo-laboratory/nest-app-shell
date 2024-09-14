import { IAuthDecodedToken } from './auth-decoded-token.interface';

export interface IAuthCheckResult {
  isValid: boolean;
  message: string;
  decodedToken?: IAuthDecodedToken; // * When pass in returnDecodedToken=true
}
