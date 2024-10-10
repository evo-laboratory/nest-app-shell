// * Application Shell Default File
// * Define your severity levels.
export const WINSTON_LEVELS: { [key: string]: number } = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4, // * Same as using Log
  verbose: 5,
};

export const WINSTON_COLORS: { [key: string]: string } = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  http: 'magenta',
  debug: 'white', // * Same as using Log
  verbose: 'black whiteBG',
};

export const LOGGER_TIMESTAMP_FORMAT = 'MM/DD/YYYY, h:mm:ss A';
