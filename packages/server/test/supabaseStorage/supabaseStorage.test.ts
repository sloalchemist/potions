import * as fs from 'fs'
import { uploadFile, downloadFile } from "../../src/services/supabaseStorage";


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
  test('Test download from S3 bucket', async () => {
      await downloadFile("test.db");
  });

    test('Test upload to S3 bucket', () => {
        const file = fileCreate();
        file.then(data => (uploadFile(data, data.name)));
  });
});

