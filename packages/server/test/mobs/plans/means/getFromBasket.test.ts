import { GetFromBasket } from '../../../../src/mobs/plans/means/getFromBasket';
import { Mob } from '../../../../src/mobs/mob';
import { Item } from '../../../../src/items/item';
import { Container } from '../../../../src/items/container';
import { calculateDistance } from '@rt-potion/common';

jest.mock('@rt-potion/common', () => ({
  calculateDistance: jest.fn()
}));

describe('GetFromBasket', () => {
  let getFromBasket: GetFromBasket;
  let mockNpc: jest.Mocked<Mob>;
  let mockBasket: jest.Mocked<Item>;
  let mockContainer: jest.Mocked<Container>;

  beforeEach(() => {
    // Mock Item
    mockBasket = {
      hasAttribute: jest
        .fn()
        .mockImplementation(
          (attr) => attr === 'items' || attr === 'templateType'
        ),
      interact: jest.fn(),
      position: { x: 5, y: 5 }
    } as unknown as jest.Mocked<Item>;

    // Mock Container
    mockContainer = {
      getInventory: jest.fn().mockReturnValue(3), // Set nonzero inventory for default test
      getCapacity: jest.fn().mockReturnValue(10)
    } as unknown as jest.Mocked<Container>;

    // Mock Container.fromItem() to return the mock container
    jest.spyOn(Container, 'fromItem').mockReturnValue(mockContainer);

    getFromBasket = new GetFromBasket(mockBasket);

    // Mock NPC with all required properties
    mockNpc = {
      name: 'NPC1',
      position: { x: 10, y: 10 },
      moveToOrExecute: jest.fn(),
      personality: {}, // Mocked as empty object for this test
      community_id: '123',
      needs: {},
      visionDistance: 5,
      id: 'npc-001',
      unlocks: [],
      tick: jest.fn(),
      type: 'type', // Add missing properties here
      subtype: 'subtype',
      gold: 100,
      health: 100
      // Add any other properties required by Mob type
    } as unknown as jest.Mocked<Mob>;

    (calculateDistance as jest.Mock).mockReset();
  });

  test('cost returns Infinity if basket has no items', () => {
    mockContainer.getInventory.mockReturnValue(0);
    expect(getFromBasket.cost(mockNpc)).toBe(Infinity);
  });

  test('cost returns distance between NPC and basket positions', () => {
    const distance = 10;
    (calculateDistance as jest.Mock).mockReturnValue(distance);
    expect(getFromBasket.cost(mockNpc)).toBe(distance);
  });
});
