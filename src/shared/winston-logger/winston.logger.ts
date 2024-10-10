// * GDK Application Shell Default File
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import {
  LOGGER_TIMESTAMP_FORMAT,
  WINSTON_COLORS,
  WINSTON_LEVELS,
} from '@shared/winston-logger/winston.static';

// * --- Console Format Setups ---

export const winstonConsoleFormat = winston.format.combine(
  // * Add the message timestamp with the preferred format
  winston.format.timestamp({ format: LOGGER_TIMESTAMP_FORMAT }),
  // * Define the format of levelUppercase (error => ERROR)
  winston.format((info) => {
    const levelSym: string = Object.getOwnPropertySymbols(
      info,
    )[0] as unknown as string;
    const levelText: string = info[levelSym];
    info.levelText = levelText;
    info.levelUppercase = info.level.replace(
      levelText,
      levelText.toUpperCase(),
    );
    return info;
  })(),
  // * Define the format of the message showing the timestamp, the level and the message
  winston.format.printf((info) => {
    return _NestJSFormat(info);
  }),
  // * Tell Winston that the logs must be colored
  winston.format.colorize({ colors: WINSTON_COLORS, all: true }),
);

function _LogPadding(logLevel: string): string {
  const spaceCount = 7 - `${logLevel}`.length;
  if (spaceCount < 0) {
    return logLevel;
  } else {
    return ' '.repeat(spaceCount) + logLevel.toUpperCase();
  }
}

function _NestJSFormat(info: any): string {
  let scopePrefix = '';
  if (info.contextName && info.methodName) {
    scopePrefix = `[${info.contextName}.${info.methodName}]`;
  } else if (info.contextName && !info.methodName) {
    scopePrefix = `[${info.contextName}]`;
  } else if (!info.contextName && info.methodName) {
    scopePrefix = `[?.${info.methodName}]`;
  }
  if (scopePrefix.length > 0) {
    // eslint-disable-next-line prettier/prettier
    return `[Wnst] ${process.pid}  - ${info.timestamp} ${_LogPadding(
      info.levelText,
    )} ${scopePrefix} ${info.message}`;
  } else {
    // eslint-disable-next-line prettier/prettier
    if (typeof info.message === 'object') {
      // eslint-disable-next-line prettier/prettier
      return `[Wnst] ${process.pid}  - ${info.timestamp} ${_LogPadding(
        info.levelText,
      )} ${JSON.stringify(info.message, null, 2)}`;
    }
    // eslint-disable-next-line prettier/prettier
    return `[Wnst] ${process.pid}  - ${info.timestamp} ${_LogPadding(
      info.levelText,
    )} ${info.message}`;
  }
}

// * --- End of Console Format Setups ---

// * --- Defined Transports ---

const rotateFileTransport: DailyRotateFile = new DailyRotateFile({
  filename: 'logs/%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
});

rotateFileTransport.on('new', () => {
  // * call function like upload to s3 or on cloud
});

const consoleFormatTransport: winston.transport =
  new winston.transports.Console({
    format: winstonConsoleFormat,
  });

export const TRANSPORTS: winston.transport[] = [
  consoleFormatTransport,
  rotateFileTransport,
];

// * --- End of Defined Transports ---
const WinstonLogger = winston.createLogger({
  levels: WINSTON_LEVELS,
  level: process.env.LOG_LEVEL || 'verbose', // * Out of NestJs process env scope
  transports: TRANSPORTS,
});

export default WinstonLogger;
