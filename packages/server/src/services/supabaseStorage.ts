import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import Database from 'better-sqlite3';

// Load environment variables from .env file
dotenv.config();

export function initializeSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Cannot run without supabase credentials in env.');
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  return supabase;
}

export async function initializeBucket(supabase: SupabaseClient) {
  const bucketName = 'serverbucket';  // Name of standard bucket everyone will use

  // Check if bucket exists
  const { data: buckets, error: fetchError } = await supabase.storage.listBuckets();

  // Throw error if applicable
  if (fetchError) {
    console.log('Error fetching buckets:', fetchError);
    throw fetchError;
  }

  // Check if bucket exists
  const bucketExists = buckets?.some((bucket) => bucket.name === bucketName);

  // If the bucket does not exist, create it
  if (!bucketExists) {
    console.log(`Bucket '${bucketName}' does not exist, creating it.`);
    const { error: createError } = await supabase.storage.createBucket(bucketName, {
      public: true,
      allowedMimeTypes: ['application/octet-stream']
    });

    // Throw error if applicable
    if (createError) {
      console.log('Error creating bucket:', createError);
      throw createError;
    }

    console.log(`Bucket '${bucketName}' created successfully.`);
  } else {
    console.log(`Bucket '${bucketName}' already exists.`);
  }
}

async function downloadFile(
  supabase_file_name: string,
  local_file_name: string,
  supabase: SupabaseClient
) {
  const bucketName = 'serverbucket';

  const { data, error } = await supabase.storage
    .from(bucketName)
    .download(supabase_file_name);

  console.log(data);

  if (error) {
    throw error;
  }

  // Convert Blob to file
  const myfile = new File([data], local_file_name, {
    type: data.type,
    lastModified: new Date().getTime()
  });

  const arrayBuffer = await myfile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  var newPath = path.join('..', 'server', 'data');
  const destPath = path.join(newPath, local_file_name); // Target file path

  fs.writeFile(destPath, buffer, (err) => {
    if (err) {
      console.error('Error writing file:', err);
    }
  });
}


async function downloadData(supabase: SupabaseClient, worldID: string) {
  await Promise.all([
    downloadFile(
      `${worldID}-knowledge-graph-snapshot.db`,
      'knowledge-graph.db',
      supabase
    ),
    downloadFile(
      `${worldID}-server-data-snapshot.db`,
      'server-data.db',
      supabase
    )
  ]);
}

function createDbSnapshot(originalDbPath: string, snapshotDbPath: string) {
  try {
    console.log(
      `Creating a snapshot of ${originalDbPath} at ${snapshotDbPath}...`
    );

    // Copy the database and its WAL file (if it exists)
    fs.copyFileSync(originalDbPath, snapshotDbPath);
    if (fs.existsSync(`${originalDbPath}-wal`)) {
      fs.copyFileSync(`${originalDbPath}-wal`, `${snapshotDbPath}-wal`);
    }

    console.log(`Snapshot created at ${snapshotDbPath}`);
  } catch (error) {
    console.error(`Error creating snapshot:`, error);
    throw error;
  }
}

function mergeWalIntoDb(dbPath: string) {
  try {
    console.log(`Merging WAL into ${dbPath} snapshot...`);

    const db = new Database(dbPath);

    // Merge WAL into the main database and switch back to DELETE mode
    db.pragma('journal_mode = DELETE');
    // Compact the database file
    db.exec('VACUUM');
    db.close();

    console.log(`Successfully merged WAL into ${dbPath}`);
  } catch (error) {
    console.error(`Error merging WAL into ${dbPath}:`, error);
    throw error;
  }
}

async function uploadLocalFile(path: string, supabase: SupabaseClient) {
  const buffer = await fs.promises.readFile('data/' + path);
  const file = new File([buffer], path, {
    type: 'application/octet-stream',
    lastModified: new Date().getTime()
  });
  const bucketName = 'serverbucket';  // Name of standard bucket everyone will use

  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(file.name, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.log('Error uploading to Supabase: ', error);
      throw error;
    }
  } catch (error) {
    console.log('Error uploading ', file.name);
    throw error;
  }
}

// Merges WAL into a snapshot, then uploads database files in supabase
async function uploadLocalData(supabase: SupabaseClient, worldID: string) {
  try {
    // Take snapshot of current state, so upload can not interrupt the next tick
    const serverDb = 'data/server-data.db';
    const serverSnapshot = `data/${worldID}-server-data-snapshot.db`;

    const knowledgeDb = 'data/knowledge-graph.db';
    const knowledgeSnapshot = `data/${worldID}-knowledge-graph-snapshot.db`;

    createDbSnapshot(serverDb, serverSnapshot);
    createDbSnapshot(knowledgeDb, knowledgeSnapshot);

    mergeWalIntoDb(serverSnapshot);
    mergeWalIntoDb(knowledgeSnapshot);

    await Promise.all([
      uploadLocalFile(`${worldID}-server-data-snapshot.db`, supabase),
      uploadLocalFile(`${worldID}-knowledge-graph-snapshot.db`, supabase)
    ]);
    console.log('Successfully uploaded local data to Supabase');
  } catch (error) {
    throw error;
  }
}

export { downloadData, uploadLocalData };
