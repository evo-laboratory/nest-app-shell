import { ERROR_CODE } from './error-code.enum';
import { ERROR_SOURCE } from './error-source.enum';

export interface IUnitedHttpException {
  source?: ERROR_SOURCE;
  errorCode?: ERROR_CODE;
  message: string;
  statusCode?: number;
  errorMeta?: any;
  errorStack?: any;
  contextName?: string;
  methodName?: string;
  disableAutoLog?: boolean;
}
