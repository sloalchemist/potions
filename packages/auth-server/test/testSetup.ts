// Mock environment variables before any imports
process.env.AUTH_SERVER_SECRET = 'test-secret';
process.env.SUPABASE_URL = 'http://test-supabase.com';
process.env.SUPABASE_KEY = 'test-key';
process.env.ABLY_API_KEY = 'test-ably-key';
process.env.PORT = '3001'; // Use a different port for testing

import { Express } from 'express';
import createApp from '../src';

/**
 * Initial common setup for testing.
 * Creates a fresh Express application instance for testing.
 */
export const setupTestServer = (): Express => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  // Create a fresh server instance for each test
  return createApp();
};

// Mock external services
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 1 },
        error: null
      })
    }))
  }))
}));

jest.mock('ably', () => ({
  Realtime: jest.fn(() => ({
    channels: {
      get: jest.fn(() => ({
        publish: jest.fn()
      }))
    }
  }))
}));
