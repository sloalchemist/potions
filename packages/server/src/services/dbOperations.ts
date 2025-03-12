import Database from 'better-sqlite3';
import fs from 'fs';
import { logger } from '../util/logger';

export function createDbSnapshot(
  originalDbPath: string,
  snapshotDbPath: string
) {
  try {
    logger.log(
      `Creating a snapshot of ${originalDbPath} at ${snapshotDbPath}...`
    );

    // Copy the database and its WAL file (if it exists)
    fs.copyFileSync(originalDbPath, snapshotDbPath);
    if (fs.existsSync(`${originalDbPath}-wal`)) {
      fs.copyFileSync(`${originalDbPath}-wal`, `${snapshotDbPath}-wal`);
    }

    logger.log(`Snapshot created at ${snapshotDbPath}`);
  } catch (error) {
    logger.error(`Error creating snapshot:`, error);
    throw error;
  }
}

export function mergeWalIntoDb(dbPath: string) {
  try {
    logger.log(`Merging WAL into ${dbPath} snapshot...`);

    const db = new Database(dbPath);

    // Merge WAL into the main database and switch back to DELETE mode
    db.pragma('journal_mode = DELETE');
    // Compact the database file
    db.exec('VACUUM');
    db.close();

    logger.log(`Successfully merged WAL into ${dbPath}`);
  } catch (error) {
    logger.error(`Error merging WAL into ${dbPath}:`, error);
    throw error;
  }
}

export function performDatabaseOperations(
  serverDb: string,
  serverSnapshot: string,
  knowledgeDb: string,
  knowledgeSnapshot: string,
  skipWalMerge = false
) {
  createDbSnapshot(serverDb, serverSnapshot);
  createDbSnapshot(knowledgeDb, knowledgeSnapshot);

  if (!skipWalMerge) {
    mergeWalIntoDb(serverSnapshot);
    mergeWalIntoDb(knowledgeSnapshot);
  }
}
