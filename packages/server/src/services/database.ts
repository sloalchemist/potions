import type { Database } from 'better-sqlite3';
import DatabaseConstructor from 'better-sqlite3';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

let DB: Database;

export function initializeServerDatabase(
  dbPath: string,
  rebuild: boolean = false
): Database {
  const absolutePath = path.resolve(dbPath);

  if (rebuild) {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      //console.log(`Deleted existing database file: ${absolutePath}`);
    }
  }

  // Initialize the database
  DB = new DatabaseConstructor(absolutePath);
  DB.pragma('journal_mode = WAL');

  // Close the database on process exit or termination signals
  const closeDatabase = () => {
    if (DB) {
      console.log('closing database');
      DB.close();
    }
  };

  process.on('exit', closeDatabase);
  process.on('SIGINT', () => {
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    process.exit(0);
  });

  return DB;
}

// Export the initialized database
export { DB };
