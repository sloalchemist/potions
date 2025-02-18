process.env.AUTH_SERVER_URL = 'test-auth-server';

import { AblyService } from '../../src/services/clientCommunication/ablyService';

jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});

const subscribedChannels: string[] = [];
const publishedMessages: object[] = [];

jest.mock('ably', () => ({
  Realtime: jest.fn().mockImplementation(() => ({
    channels: {
      get: jest.fn().mockImplementation((channelName: string) => ({
        subscribe: jest.fn().mockImplementation((event, callback) => {
          subscribedChannels.push(event);
        }),
        publish: jest.fn().mockImplementation((name, data) => {
          publishedMessages.push({ name, data });
        }),
        presence: {
          subscribe: jest.fn(),
          get: jest.fn().mockImplementation((cb) => {
            cb(null, [{ clientId: 'dummy' }]);
          })
        }
      }))
    }
  }))
}));

jest.mock('../../src/services/setup', () => ({
  initializeAsync: jest.fn(),
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: new Blob(), error: null })
      }))
    }
  }
}));

const testAblyService = () => {
  subscribedChannels.length = 0;
  publishedMessages.length = 0;

  const service = new AblyService('test-key', 'test-world');
  service.setupChannels('test-user', 1, 100, 50, 10);
  return service;
};

describe('AblyService stashing and unstashing broadcasts', () => {
  beforeEach(() => {
    publishedMessages.length = 0;
    subscribedChannels.length = 0;
  });

  it('publishes stash_item broadcast after sending broadcast (when client is connected)', () => {
    const ablyService = testAblyService();
    (ablyService as any).hasConnectedClients = true;

    ablyService.startBroadcasting();
    ablyService.stashItem('item123', 'mob123', { x: 10, y: 20 });
    ablyService.sendBroadcast();

    expect(publishedMessages).toContainEqual({
      name: 'tick',
      data: {
        broadcast: [
          {
            type: 'stash_item',
            data: { item_key: 'item123', mob_key: 'mob123', position: { x: 10, y: 20 } }
          }
        ]
      }
    });
  });

  it('publishes unstash_item broadcast after sending broadcast (when client is connected)', () => {
    const ablyService = testAblyService();
    (ablyService as any).hasConnectedClients = true;

    ablyService.startBroadcasting();
    ablyService.unstashItem('item456', 'mob456', { x: 5, y: 25 });
    ablyService.sendBroadcast();

    expect(publishedMessages).toContainEqual({
      name: 'tick',
      data: {
        broadcast: [
          {
            type: 'unstash_item',
            data: { item_key: 'item456', mob_key: 'mob456', position: { x: 5, y: 25 } }
          }
        ]
      }
    });
  });
});