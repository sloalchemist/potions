import type { Database } from 'better-sqlite3';
import DatabaseConstructor from 'better-sqlite3';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

let DB: Database;

export function initializeDatabase(
  dbPath: string,
  rebuild: boolean = false
): Database {
  const absolutePath = path.resolve(dbPath);

  if (rebuild) {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  // Initialize the database
  DB = new DatabaseConstructor(absolutePath);
  DB.pragma('journal_mode = WAL');

  // Close the database on process exit
  process.on('exit', () => DB.close());

  return DB;
}

// Export the initialized database
export { DB };
