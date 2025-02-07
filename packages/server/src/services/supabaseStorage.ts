import fs from 'fs';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config();

export function initializeSupabase() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Cannot run without supabase credentials in env.');
  }

  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );
}

async function downloadFile(file: string, supabase: SupabaseClient) {
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

async function downloadData(supabase: SupabaseClient) {
  await Promise.all([
    downloadFile('knowledge-graph.db', supabase),
    downloadFile('knowledge-graph.db-wal', supabase),
    downloadFile('knowledge-graph.db-shm', supabase),
    downloadFile('server-data.db', supabase),
    downloadFile('server-data.db-wal', supabase),
    downloadFile('server-data.db-shm', supabase)
  ]);
}

async function uploadLocalFile(path: string, supabase: SupabaseClient) {
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
    const { error } = await supabase.storage
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

async function uploadLocalData(supabase: SupabaseClient) {
  try {
    await Promise.all([
      uploadLocalFile('server-data.db', supabase),
      uploadLocalFile('server-data.db-wal', supabase),
      uploadLocalFile('server-data.db-shm', supabase),
      uploadLocalFile('knowledge-graph.db', supabase),
      uploadLocalFile('knowledge-graph.db-wal', supabase),
      uploadLocalFile('knowledge-graph.db-shm', supabase)
    ]);
    console.log('Successfully uploaded local data to Supabase');
  } catch (error) {
    throw error;
  }
}

export { downloadData, uploadLocalData };
