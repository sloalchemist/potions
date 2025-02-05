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
        throw Error("Your server env needs the SUPABASE_BUCKET var. Check README for info")
    }

    const { data, error } = await supabase
        .storage
        .from(process.env.SUPABASE_BUCKET)
        .download(file);
    
    console.log(data)
    
    if (error) {
        console.error('Error downloading db file:', error.message);
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
            console.error("Error writing file:", err);
        }
    });
}

async function uploadFile(file: File, filePath: string) {
    if (!process.env.SUPABASE_BUCKET) {
        throw Error("Your server env needs the SUPABASE_BUCKET var. Check README for info")
    }
    const { data, error } = await supabase
        .storage
        .from(process.env.SUPABASE_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true
        });

    if (error) {
        console.log("Error uploading to Supabase: ", error);
        throw error;
    }
}

async function uploadLocalFile(path: string) {
    const buffer = await fs.promises.readFile("data/" + path);
    const file = new File([buffer], path, {
        type: "application/octet-stream",
        lastModified: new Date().getTime()
    });

    try {
        uploadFile(file, file.name);
    } catch (error) {
        console.log("Error uploading ", file.name);
        throw error;
    }
}

async function uploadLocalData() {
    uploadLocalFile("server-data.db");
    uploadLocalFile("server-data.db-wal");
    uploadLocalFile("server-data.db-shm");
    uploadLocalFile("knowledge-graph.db");
    uploadLocalFile("knowledge-graph.db-wal");
    uploadLocalFile("knowledge-graph.db-shm");
  }

export { uploadFile, downloadFile, uploadLocalData };