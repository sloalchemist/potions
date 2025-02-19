import {
  updateCharacterData,
  getWorlds,
  PlayerData
} from '../../src/services/authMarshalling';

// Mock getEnv
jest.mock('@rt-potion/common', () => ({
  getEnv: jest.fn((name: string) => {
    switch (name) {
      case 'AUTH_SERVER_URL':
        return 'http://test-auth-server.com';
      case 'AUTH_SERVER_SECRET':
        return 'test-secret';
      default:
        throw new Error(`Unexpected env var requested: ${name}`);
    }
  })
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('Auth Marshalling Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
});
