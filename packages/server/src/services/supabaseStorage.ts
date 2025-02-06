import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

export const supabase = initializeSupabase();

function initializeSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Cannot run without supabase credentials in env.');
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

async function downloadFile(file: string) {
  if (!process.env.SUPABASE_BUCKET) {
    throw Error(
      'Your server env needs the SUPABASE_BUCKET var. Check README for info'
    );
  }

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .download(file);

  console.log(data);

  if (error) {
    throw error;
  }

  var path = require('path');

  // Convert Blob to file
  const myfile = new File([data], file, {
    type: data.type,
    lastModified: new Date().getTime()
  });

  const arrayBuffer = await myfile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  var newPath = path.join('..', 'server', 'data');
  const destPath = path.join(newPath, file); // Target file path

  fs.writeFile(destPath, buffer, (err) => {
    if (err) {
      console.error('Error writing file:', err);
    }
  });
}

async function downloadData() {
  await Promise.all([
    downloadFile('knowledge-graph.db'),
    downloadFile('knowledge-graph.db-wal'),
    downloadFile('knowledge-graph.db-shm'),
    downloadFile('server-data.db'),
    downloadFile('server-data.db-wal'),
    downloadFile('server-data.db-shm')
  ]);
}

async function uploadLocalFile(path: string) {
  const buffer = await fs.promises.readFile('data/' + path);
  const file = new File([buffer], path, {
    type: 'application/octet-stream',
    lastModified: new Date().getTime()
  });

  try {
    if (!process.env.SUPABASE_BUCKET) {
      throw Error(
        'Your server env needs the SUPABASE_BUCKET var. Check README for info'
      );
    }
    const { data, error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
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

async function uploadLocalData() {
  try {
    await Promise.all([
      uploadLocalFile('server-data.db'),
      uploadLocalFile('server-data.db-wal'),
      uploadLocalFile('server-data.db-shm'),
      uploadLocalFile('knowledge-graph.db'),
      uploadLocalFile('knowledge-graph.db-wal'),
      uploadLocalFile('knowledge-graph.db-shm')
    ]);
    console.log('Successfully uploaded local data to Supabase');
  } catch (error) {
    throw error;
  }
}

function shouldUploadDB(now: number, lastUpdated: number) {
  const interval = 600000; // ten minutes
  return now - lastUpdated >= interval;
}

export { downloadData, uploadLocalData, shouldUploadDB };
