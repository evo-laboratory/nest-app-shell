// * GDK Application Shell Default File
import { isPromise } from 'util/types';
import WinstonLogger from '@shared/winston-logger/winston.logger';

export function MethodLogger() {
  return function (
    // eslint-disable-next-line @typescript-eslint/ban-types
    target: Object,
    key: string | symbol, // * MethodName
    descriptor: PropertyDescriptor,
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const originalMethod: Function | undefined = descriptor.value;
    if (typeof originalMethod !== 'function') return descriptor;
    descriptor.value = function (...args) {
      const className = this.constructor?.name || '';

      function logSuccess() {
        WinstonLogger.info(`Executed`, {
          contextName: className,
          methodName: key,
        });
      }

      function logFailed(error: any) {
        WinstonLogger.error(error?.message || error || 'Unknown error', {
          contextName: className,
          methodName: key || error.methodName,
        });
        if (!process.env.DISABLE_ERROR_META) {
          WinstonLogger.error(
            JSON.stringify(
              error.errorObject || error || { message: 'Unknown error' },
              null,
              4,
            ),
            {
              contextName: className,
              methodName: key,
            },
          );
        }
      }
      let executeResult;
      try {
        executeResult = originalMethod.apply(this, args);
        isPromise(executeResult)
          ? executeResult.then(logSuccess).catch(logFailed)
          : logSuccess();
      } catch (ex) {
        logFailed(ex);
        throw ex;
      }
      return executeResult;
    };
  };
}
