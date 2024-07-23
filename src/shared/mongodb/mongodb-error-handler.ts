import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
} from '@shared/exceptions';

export function MongoDBErrorHandler(error: any): IUnitedHttpException {
  if (error.response && error.response.isUnitedHttpException) {
    return error;
  }
  const errorObj: IUnitedHttpException = {
    isUnitedHttpException: true,
    source: ERROR_SOURCE.MONGODB,
    errorCode: error.errorCode || ERROR_CODE.UNKNOWN,
    statusCode: error.statusCode || 500,
    message: error.message || 'no error message',
    errorMeta: error,
    disableAutoLog: true,
  };
  if (error._message && error._message.includes('validation failed')) {
    errorObj.errorCode = ERROR_CODE.SCHEMA_VALIDATE_FAILED;
  }
  return errorObj;
}
