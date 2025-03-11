import Database from 'better-sqlite3'; // Default import for the actual class
import type { Database as DatabaseType } from 'better-sqlite3'; // Type import for TypeScript
import DatabaseConstructor from 'better-sqlite3';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { logger } from '../util/logger';

// Load environment variables from .env file
dotenv.config();

let DB: DatabaseType;

export function initializeTestServerDatabase() {
  DB = new DatabaseConstructor(':memory:');
}

export function initializeServerDatabase(
  dbPath: string,
  rebuild: boolean = false
) {
  const absolutePath = path.resolve(dbPath);

  if (rebuild) {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      //logger.log(`Deleted existing database file: ${absolutePath}`);
    }
    const directoryPath = path.dirname(dbPath);
    if (!fs.existsSync(directoryPath)) {
      logger.log(`Creating directory: ${directoryPath}`);
      fs.mkdirSync(directoryPath, { recursive: true });
    }
  }

  // Initialize the database
  DB = new Database(dbPath);
  DB.pragma('journal_mode = WAL');

  // Close the database on process exit or termination signals
  const closeDatabase = () => {
    if (DB) {
      logger.log('Closing database...');
      DB.close();
    }
  };

  process.on('exit', closeDatabase);
  process.on('SIGINT', async () => {
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    process.exit(0);
  });
  // Nodemon sends SIGUSR2 when restarting
  process.on('SIGUSR2', async () => {
    process.exit(0);
  });

  return DB;
}

// Export the initialized database
export { DB };
