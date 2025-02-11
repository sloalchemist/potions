import { shouldUploadDB } from '../../src/util/dataUploadUtil';

describe('Upload and Download Supabase Bucket', () => {
  test('Test upload frequency to Supabase', () => {
    const now = Date.now();
    const aMinBefore = now - 60000;
    const tenMinBefore = now - 600001;
    expect(shouldUploadDB(now, aMinBefore)).toBeFalsy();
    expect(shouldUploadDB(now, tenMinBefore)).toBeTruthy();
  });
});
