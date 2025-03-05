import log4js from 'log4js';
import path from 'path';

const logDir = path.resolve(__dirname, '../logs');

log4js.configure({
  appenders: {
    console: { type: 'stdout' },
    file: { type: 'file', filename: path.join(logDir, 'app.log'), maxLogSize: 10485760, backups: 3 },
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'info' },
    fileOnly: { appenders: ['file'], level: 'trace' },
  },
});

const consoleLogger = log4js.getLogger(); // Logs to console and file
const fileLogger = log4js.getLogger('fileOnly'); // Logs to file only

const logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
type LogLevel = (typeof logLevels)[number];

export function isValidLogLevel(level: string): level is LogLevel {
  return logLevels.includes(level as LogLevel);
}

// Helper function to format log arguments so that any input to console.log can be logged
function formatArgs(args: unknown[]): string | undefined {
  if (args == undefined ){
    return undefined
  }
  return args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg) : String(arg))).join(' ');
}

// Logger object that contains all logging functions
export const logger = {
  setConsoleLogLevel: (level: LogLevel) => {
    consoleLogger.level = level;
  },

  log: (...args: unknown[]) => logger.info(...args),

  trace: (...args: unknown[]) => {
    const message = formatArgs(args);
    consoleLogger.trace(message);
    fileLogger.trace(message);
  },

  debug: (...args: unknown[]) => {
    const message = formatArgs(args);
    consoleLogger.debug(message);
    fileLogger.debug(message);
  },

  info: (...args: unknown[]) => {
    const message = formatArgs(args);
    consoleLogger.info(message);
    fileLogger.info(message);
  },

  warn: (...args: unknown[]) => {
    const message = formatArgs(args);
    consoleLogger.warn(message);
    fileLogger.warn(message);
  },

  error: (...args: unknown[]) => {
    console.log("Args to error:", args);
    const message = formatArgs(args);
    consoleLogger.error(message);
    fileLogger.error(message);
  },

  fatal: (...args: unknown[]) => {
    const message = formatArgs(args);
    consoleLogger.fatal(message);
    fileLogger.fatal(message);
  },
};
