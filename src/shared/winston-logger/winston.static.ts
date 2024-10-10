// * Application Shell Default File
// * Define your severity levels.
// * Use from WINSTON_LOGGER_LEVEL

// * Suggested ENV for difference STAGE:
// * DEV => verbose / debug, general "debug" should be enough, "verbose" is really verbose.
export const WINSTON_LEVELS: { [key: string]: number } = {
  error: 0,
  warn: 1,
  http: 2, // * WINSTON_LOG_VARIANT_LEVEL, if use with NestJs Common Logger.log(MSG>, <IWinstonLogOpt>)
  info: 3, // * WINSTON_LOG_VARIANT_LEVEL, if use with NestJs Common Logger.log(MSG>, <IWinstonLogOpt>)
  debug: 4, // * Same as if use with NestJs Common Logger.log
  verbose: 5,
};

export const WINSTON_COLORS: { [key: string]: string } = {
  error: 'red',
  warn: 'yellow',
  http: 'magenta',
  info: 'blue',
  debug: 'white',
  verbose: 'grey',
};

export const LOGGER_TIMESTAMP_FORMAT = 'MM/DD/YYYY, h:mm:ss A';
