import type { Database } from 'better-sqlite3';
import DatabaseConstructor from 'better-sqlite3';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { uploadLocalData } from './supabaseStorage';

// Load environment variables from .env file
dotenv.config();

let DB: Database;

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
      //console.log(`Deleted existing database file: ${absolutePath}`);
    }
  }

  // Initialize the database
  DB = new DatabaseConstructor(dbPath);
  DB.pragma('journal_mode = WAL');

  // Close the database on process exit or termination signals
const closeDatabase = () => {
  if (DB) {
    console.log('Closing database...');
    DB.close();
  }
};

  // Function to handle graceful shutdown and upload database
  const handleExit = async () => {
    console.log('Process exiting, uploading database...');
    try {
      await uploadLocalData();
    } catch (error) {
      console.error('Error uploading database:', error);
    } finally {
      closeDatabase();
      process.exit(0);
    }
  };

  process.on('exit', closeDatabase);
  process.on('beforeExit', handleExit);
  process.on('SIGINT', async () => {
    await handleExit();
  });
  process.on('SIGTERM', async () => {
    await handleExit();
  });


  return DB;
}

// Export the initialized database
export { DB };
