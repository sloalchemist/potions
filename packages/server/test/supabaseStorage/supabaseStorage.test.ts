import * as fs from 'fs'
import { lastUpdated, shouldUploadDB } from "../../src/services/supabaseStorage";


async function fileCreate() {
  const fileBufferServer = await fs.promises.readFile("data/server-data.db", 'utf-8')
  const blobServer = new Blob([fileBufferServer], { type: "binary/octet-stream" });
  const fileServer = new File([blobServer], "server-data.db", {
      type: blobServer.type,
      lastModified: new Date().getTime()
  });
    return fileServer;
}

describe('Upload and Download Supabase Bucket', () => {

    test('Test upload to S3 bucket', () => {
        const currentTime = Date.now();
        const uploadTime = Date.now() + 600001;
        expect(shouldUploadDB(currentTime)).toBeFalsy();
        expect(shouldUploadDB(uploadTime)).toBeTruthy();
    });
    
    test('Test upload to S3 bucket', () => {
        const currentTime = Date.now();
        const uploadTime = Date.now() + 600001;
        expect(shouldUploadDB(currentTime)).toBeFalsy();
        expect(shouldUploadDB(uploadTime)).toBeTruthy();
    });
});

