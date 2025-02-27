/**
 * Logger is a singleton class responsible for handling sever logging to the console.
 * It is designed to be used for all non-CLI logging.
 *
 * This class allows for logging to be toggled on and off within the dev environment.
 */
class Logger {
  private static instance: Logger;
  private loggingEnabled: boolean = true;

  private constructor() {}

  /**
   * Returns the singleton instance of Logger.
   * If an instance doesn't exist yet, it creates one.
   * @returns {Logger} The Logger instance.
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public enableLogging(): void {
    this.loggingEnabled = true;
    console.log(`Logging enabled`);
  }

  public disableLogging(): void {
    this.loggingEnabled = false;
    console.log(`Logging disabled`);
  }

  toggleLogging() {
    this.loggingEnabled = !this.loggingEnabled;
    console.log(`Logging ${this.loggingEnabled ? 'enabled' : 'disabled'}`);
  }

  log(...args: unknown[]) {
    if (this.loggingEnabled) {
      console.log(...args);
    }
  }

  warn(...args: unknown[]) {
    if (this.loggingEnabled) {
      console.warn(...args);
    }
  }

  error(...args: unknown[]) {
      console.error(...args);
  }
}

export const logger = Logger.getInstance();
