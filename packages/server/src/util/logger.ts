import log4js from 'log4js';
import path from 'path';

const logDir = path.resolve(__dirname, '../../logs');

log4js.configure({
  appenders: {
    console: { type: 'stdout' },
    file: {
      type: 'file',
      filename: path.join(logDir, 'app.log'),
      maxLogSize: 10485760,
      backups: 3
    }
  },
  categories: {
    default: { appenders: ['console'], level: 'info' },
    fileOnly: { appenders: ['file'], level: 'trace' }
  }
});

const consoleLogger = log4js.getLogger(); // Logs to console and file
const fileLogger = log4js.getLogger('fileOnly'); // Logs to file only

const logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
type LogLevel = (typeof logLevels)[number];

export function isValidLogLevel(level: string): level is LogLevel {
  return logLevels.includes(level as LogLevel);
}

// Logger object that contains all logging functions
export const logger = {
  setConsoleLogLevel: (level: LogLevel) => {
    consoleLogger.level = level;
  },

  log: (message: string, ...args: unknown[]) => logger.info(message, ...args),

  trace: (message: string, ...args: unknown[]) => {
    consoleLogger.trace(message, ...args);
    fileLogger.trace(message, ...args);
  },

  debug: (message: string, ...args: unknown[]) => {
    consoleLogger.debug(message, ...args);
    fileLogger.debug(message, ...args);
  },

  info: (message: string, ...args: unknown[]) => {
    consoleLogger.info(message, ...args);
    fileLogger.info(message, ...args);
  },

  warn: (message: string, ...args: unknown[]) => {
    consoleLogger.warn(message, ...args);
    fileLogger.warn(message);
  },

  error: (message: string, ...args: unknown[]) => {
    consoleLogger.error(message, ...args);
    fileLogger.error(message, ...args);
  },

  fatal: (message: string, ...args: unknown[]) => {
    consoleLogger.fatal(message, ...args);
    fileLogger.fatal(message, ...args);
  }
};
