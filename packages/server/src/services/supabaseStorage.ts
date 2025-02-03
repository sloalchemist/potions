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

    // File stored in data as Blob object
    const { data, error } = await supabase
        .storage
        .from(process.env.SUPABASE_BUCKET)
        .download(file);
    
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

    await fs.writeFile(destPath, buffer, (err) => {
        if (err) {
            console.error("Error writing file:", err);
        } else {
            console.log(`File saved to ${destPath}`);
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

export { uploadFile, downloadFile };