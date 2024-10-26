import {
  ERROR_CODE,
  ERROR_SOURCE,
  IUnitedHttpException,
  UniteHttpException,
} from '@shared/exceptions';

export function MongoDBErrorHandler(error: any): IUnitedHttpException {
  // * This checks if already is thrown UnitedHttpException
  if (error instanceof UniteHttpException) {
    return error;
  }
  const errorObj: IUnitedHttpException = {
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
  if (error.message && error.message.includes('validation failed')) {
    errorObj.errorCode = ERROR_CODE.SCHEMA_VALIDATE_FAILED;
  }
  if (error.message && error.message.includes('Cast to ObjectId failed')) {
    errorObj.errorCode = ERROR_CODE.CAST_TO_OBJECT_FAILED;
  }
  console.log(error.message);
  console.log('--------------');
  return errorObj;
}
