import {
  updateCharacterData,
  getWorlds,
  PlayerData
} from '../../src/services/authMarshalling';

// Mock fetch globally
global.fetch = jest.fn();

describe('Auth Marshalling Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset environment before each test
    process.env = { ...originalEnv };
    process.env.AUTH_SERVER_URL = 'http://test-auth-server.com';
    process.env.AUTH_SERVER_SECRET = 'test-secret';
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Authorization Headers', () => {
    const mockPlayerData: PlayerData = {
      current_world_id: 1,
      health: 100,
      name: 'TestHero',
      gold: 500,
      attack: 10,
      appearance: 'warrior'
    };

    it('should include authorization header in updateCharacterData', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ message: 'success', data: [mockPlayerData] })
      });

      expect(process.env.AUTH_SERVER_URL).toBe('http://test-auth-server.com');

      await updateCharacterData(1, mockPlayerData);

      const [[url, options]] = (fetch as jest.Mock).mock.calls;
      expect(url.toString()).toBe('http://test-auth-server.com/character/1');
      expect(options).toEqual({
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-secret'
        },
        body: JSON.stringify(mockPlayerData)
      });
    });

    it('should include authorization header in getWorlds', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        json: () => Promise.resolve([])
      });

      await getWorlds();

      const [[url, options]] = (fetch as jest.Mock).mock.calls;
      expect(url.toString()).toBe('http://test-auth-server.com/worlds');
      expect(options).toEqual({
        headers: {
          Authorization: 'Bearer test-secret'
        }
      });
    });
  });

  describe('Environment Variable Behavior', () => {
    // Store original JEST_WORKER_ID
    const originalJestWorkerId = process.env.JEST_WORKER_ID;

    afterEach(() => {
      // Restore JEST_WORKER_ID after each test
      process.env.JEST_WORKER_ID = originalJestWorkerId;
    });

    it('should not throw error when AUTH_SERVER_SECRET is missing in test environment', () => {
      // Ensure we're in test environment
      process.env.JEST_WORKER_ID = '1';
      // Remove AUTH_SERVER_SECRET
      delete process.env.AUTH_SERVER_SECRET;

      // This should not throw an error because we're in test environment
      expect(() => {
        // Re-import the module to trigger the environment check
        jest.isolateModules(() => {
          import('../../src/services/authMarshalling');
        });
      }).not.toThrow();
    });

    it('should not throw error when AUTH_SERVER_URL is missing in test environment', () => {
      // Ensure we're in test environment
      process.env.JEST_WORKER_ID = '1';
      // Remove AUTH_SERVER_URL
      delete process.env.AUTH_SERVER_URL;

      // This should not throw an error because we're in test environment
      expect(() => {
        // Re-import the module to trigger the environment check
        jest.isolateModules(() => {
          import('../../src/services/authMarshalling');
        });
      }).not.toThrow();
    });

    // MAYBE - TODO:
    /* To test the error throwing in production environment:
     * 1. Create a separate script that imports authMarshalling.ts
     * 2. Run it with NODE_ENV=production and without AUTH_SERVER_SECRET
     * 3. Verify it throws the appropriate error
     *
     * Example script (checkAuth.js):
     * ```
     * try {
     *   require('./authMarshalling');
     * } catch (e) {
     *   console.error('Error:', e.message);
     *   process.exit(1);
     * }
     * ```
     *
     * Run with: NODE_ENV=production AUTH_SERVER_URL=http://example.com node checkAuth.js
     */
  });
});
