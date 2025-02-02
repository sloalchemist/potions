import fs from 'fs';
import { supabase } from "../../../auth-server/src/authController"


async function downloadFile(file: string) {
    // File stored in data as Blob object
    const { data, error } = await supabase
        .storage
        .from('world-db-data')
        .download(file);
    
    if (error) {
        console.error('Error downloading db file:', error.message);
        return;
    }

    // Convert Blob to file
    const myFile = new File([data], file, {
        type: data.type,
        lastModified: new Date().getTime()
    });

    // Rename file, moving to to data location
    var path = require('path');
    var newPath = path.join('..', 'data', file);
    var oldPath = path.join('.', file);
    fs.rename(oldPath, newPath, (err) => {
        if (err) {
            console.error('Error moving file:', err);
        } else {
            console.log('File moved successfully!');
        }
    });
}


async function uploadFile(file: File, filePath: string) {
    const { data, error } = await supabase
        .storage
        .from('world-db-data')
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });
}

export { uploadFile, downloadFile };