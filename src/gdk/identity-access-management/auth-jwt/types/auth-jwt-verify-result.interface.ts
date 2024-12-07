import { ERROR_CODE } from '@shared/exceptions';

export interface IAuthJWTVerifyResult<T> {
  decodedToken: T;
  isError: boolean;
  errorCode:
    | ERROR_CODE.AUTH_TOKEN_INVALID
    | ERROR_CODE.AUTH_TOKEN_UNKNOWN_ERROR;
}
