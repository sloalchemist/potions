process.env.AUTH_SERVER_URL = 'test-auth-server';

import { AblyService } from '../../src/services/clientCommunication/ablyService';

const TEST_USER = 'test-user';

// mock collection of subscribed channels
const subscribedChannels: string[] = [];
// mock queue of published messages
const publishedMessages: object[] = [];

jest.mock('ably', () => ({
  Realtime: jest.fn().mockImplementation(() => ({
    channels: {
      get: jest.fn().mockImplementation(() => ({
        subscribe: jest.fn().mockImplementation((name, _) => {
          subscribedChannels.push(name);
        }),
        publish: jest.fn().mockImplementation((name, data) => {
          publishedMessages.push({ name, data });
        }),
        presence: {
          subscribe: jest.fn()
        }
      }))
    }
  }))
}));

const testAblyService = () => {
  const ablyService = new AblyService('test-key');
  ablyService.setupChannels(TEST_USER, 0, 0, 0, 0);
  return ablyService;
};

describe('Ably service', () => {
  beforeEach(() => {
    // clear subscribed channels
    subscribedChannels.length = 0;
    // clear published messages
    publishedMessages.length = 0;
  });

  it.each`
    channelName
    ${'fight_request'}
    ${'fight'}
  `('subscribes to $channelName channel', ({ channelName }) => {
    testAblyService();

    expect(subscribedChannels).toContain(channelName);
  });

  it('publishes message for attack options', async () => {
    const ablyService = testAblyService();

    await ablyService.playerAttacks(TEST_USER, ['test-attack']);

    expect(publishedMessages).toEqual([
      {
        name: 'player_attacks',
        data: { attacks: ['test-attack'] }
      }
    ]);
  });

  it('publishes message for fight close', async () => {
    const ablyService = testAblyService();

    await ablyService.closeFight('test-mob', TEST_USER);

    expect(publishedMessages).toEqual([
      {
        name: 'fight_close',
        data: { target: 'test-mob' }
      }
    ]);
  });
});
