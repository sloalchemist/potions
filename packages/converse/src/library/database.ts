import type { Database } from 'better-sqlite3';
import DatabaseConstructor from 'better-sqlite3';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load environment variables from .env file
dotenv.config();

let DB: Database;

/**
 * Initializes an instance of the SQLite database.
 */
export function initializeInMemoryDatabase() {
  DB = new DatabaseConstructor(':memory:');
}

/**
 * Initializes an SQLite database from a file.
 *
 * @param dbPath - The path to the database file.
 * @param rebuild - Whether to rebuild the database if it already exists.
 */
export function initializeDatabase(dbPath: string, rebuild: boolean = false) {
  const absolutePath = path.resolve(dbPath);

  if (rebuild) {
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  // Initialize the database
  DB = new DatabaseConstructor(absolutePath);
  DB.pragma('journal_mode = WAL');

  // Close the database connection
  process.on('exit', () => {
    DB.close();
  });
}

// Export the initialized database
export { DB };
