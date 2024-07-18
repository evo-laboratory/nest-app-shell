import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';

export function MongoDBErrorHandler(error: any) {
  const errorObj: IUnitedHttpException = {
    source: ERROR_SOURCE.MONGODB,
    errorCode: ERROR_CODE.UNKNOWN,
    statusCode: 500,
    message: error.message,
    errorMeta: error,
    disableAutoLog: true,
  };
  if (error._message && error._message.includes('validation failed')) {
    errorObj.errorCode = ERROR_CODE.SCHEMA_VALIDATE_FAILED;
  }
  throw new UniteHttpException(errorObj);
}
