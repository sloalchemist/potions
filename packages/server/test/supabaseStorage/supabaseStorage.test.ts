import { shouldUploadDB } from '../../src/util/dataUploadUtil';
import { SupabaseClient } from '@supabase/supabase-js';
import fs from 'fs';
import {
  uploadLocalFile,
  uploadLocalData
} from '../../src/services/supabaseStorage';
import { logger } from '../../src/util/logger';

type StorageError = {
  message: string;
  statusCode?: string;
};

// Mock the modules
jest.mock('@supabase/supabase-js');
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  },
  copyFileSync: jest.fn(),
  existsSync: jest.fn().mockReturnValue(false)
}));
jest.mock('../../src/util/logger', () => ({
  logger: {
    log: jest.fn(),
    error: jest.fn()
  }
}));
jest.mock('better-sqlite3', () => {
  return jest.fn().mockImplementation(() => ({
    pragma: jest.fn(),
    exec: jest.fn(),
    close: jest.fn()
  }));
});

describe('Upload and Download Supabase Bucket', () => {
  test('Test upload frequency to Supabase', () => {
    const now = Date.now();
    const aMinBefore = now - 60000;
    const tenMinBefore = now - 600001;
    expect(shouldUploadDB(now, aMinBefore)).toBeFalsy();
    expect(shouldUploadDB(now, tenMinBefore)).toBeTruthy();
  });

  describe('Error Handling', () => {
    let mockSupabase: jest.Mocked<SupabaseClient>;
    const mockBuffer = Buffer.from('test data');

    beforeEach(() => {
      jest.clearAllMocks();
      (fs.promises.readFile as jest.Mock).mockResolvedValue(mockBuffer);

      const uploadFn = jest.fn();
      mockSupabase = {
        storage: {
          from: jest.fn().mockReturnValue({
            upload: uploadFn
          })
        }
      } as unknown as jest.Mocked<SupabaseClient>;
    });

    describe('uploadLocalFile', () => {
      it('should successfully upload a file and return true', async () => {
        const uploadFn = mockSupabase.storage.from('serverbucket')
          .upload as jest.Mock;
        uploadFn.mockResolvedValue({ data: {}, error: null });

        const result = await uploadLocalFile('test.db', mockSupabase);

        expect(result).toBe(true);
        expect(logger.error).not.toHaveBeenCalled();
        expect(mockSupabase.storage.from).toHaveBeenCalledWith('serverbucket');
      });

      it('should handle Supabase upload error without crashing', async () => {
        const error: StorageError = { message: 'Upload failed' };
        const uploadFn = mockSupabase.storage.from('serverbucket')
          .upload as jest.Mock;
        uploadFn.mockResolvedValue({ data: null, error });

        const result = await uploadLocalFile('test.db', mockSupabase);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith(
          'Error uploading to Supabase: ',
          error
        );
      });

      it('should handle file read error without crashing', async () => {
        const error = new Error('File read failed');
        (fs.promises.readFile as jest.Mock).mockRejectedValue(error);

        const result = await uploadLocalFile('test.db', mockSupabase);

        expect(result).toBe(false);
        expect(logger.error).toHaveBeenCalledWith(
          'Error uploading file',
          'test.db',
          ':',
          error
        );
      });
    });

    describe('uploadLocalData', () => {
      it('should handle successful upload of both files', async () => {
        const uploadFn = mockSupabase.storage.from('serverbucket')
          .upload as jest.Mock;
        uploadFn.mockResolvedValue({ data: {}, error: null });

        await uploadLocalData(mockSupabase, 'world1');

        expect(logger.log).toHaveBeenCalledWith(
          'Successfully uploaded local data to Supabase'
        );
        expect(logger.error).not.toHaveBeenCalled();
      });

      it('should handle partial upload failure without crashing', async () => {
        const uploadFn = mockSupabase.storage.from('serverbucket')
          .upload as jest.Mock;
        uploadFn
          .mockResolvedValueOnce({ data: {}, error: null })
          .mockResolvedValueOnce({
            data: null,
            error: { message: 'Upload failed' } as StorageError
          });

        await uploadLocalData(mockSupabase, 'world1');

        expect(logger.error).toHaveBeenCalledWith(
          'One or more files failed to upload to Supabase'
        );
      });

      it('should handle complete upload failure without crashing', async () => {
        const error = new Error('Critical error');
        const uploadFn = mockSupabase.storage.from('serverbucket')
          .upload as jest.Mock;
        uploadFn.mockRejectedValue(error);

        await uploadLocalData(mockSupabase, 'world1');

        expect(logger.error).toHaveBeenCalledWith(
          'Error uploading file',
          'world1-server-data-snapshot.db',
          ':',
          error
        );
        expect(logger.error).toHaveBeenCalledWith(
          'Error uploading file',
          'world1-knowledge-graph-snapshot.db',
          ':',
          error
        );
      });
    });
  });
});
