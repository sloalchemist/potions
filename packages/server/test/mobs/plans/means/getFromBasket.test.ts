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
    // Create a mock basket item.
    mockBasket = {
      hasAttribute: jest
        .fn()
        .mockImplementation(
          (attr) => attr === 'items' || attr === 'templateType'
        ),
      interact: jest.fn(),
      position: { x: 5, y: 5 }
    } as unknown as jest.Mocked<Item>;

    // Create a mock container that will be returned via Container.fromItem.
    mockContainer = {
      getInventory: jest.fn().mockReturnValue(3), // nonzero inventory for normal operation
      getCapacity: jest.fn().mockReturnValue(10)
    } as unknown as jest.Mocked<Container>;

    // Ensure Container.fromItem returns our mock container.
    jest.spyOn(Container, 'fromItem').mockReturnValue(mockContainer);

    // Create the GetFromBasket instance.
    getFromBasket = new GetFromBasket(mockBasket);

    // Create a mock NPC with required properties.
    mockNpc = {
      name: 'NPC1',
      position: { x: 10, y: 10 },
      moveToOrExecute: jest.fn(),
      personality: {},
      community_id: '123',
      needs: {},
      visionDistance: 5,
      id: 'npc-001',
      unlocks: [],
      tick: jest.fn(),
      type: 'type',
      subtype: 'subtype',
      gold: 100,
      health: 100
    } as unknown as jest.Mocked<Mob>;

    (calculateDistance as jest.Mock).mockReset();
  });

  // --- Tests for cost() method ---

  test('cost returns Infinity if basket has no items', () => {
    // Simulate an empty basket.
    mockContainer.getInventory.mockReturnValue(0);
    expect(getFromBasket.cost(mockNpc)).toBe(Infinity);
  });

  test('cost returns distance between NPC and basket positions', () => {
    const distance = 10;
    (calculateDistance as jest.Mock).mockReturnValue(distance);
    expect(getFromBasket.cost(mockNpc)).toBe(distance);
  });

  test('cost throws an error if npc.position is missing', () => {
    Object.defineProperty(mockNpc, 'position', { value: undefined });
    expect(() => getFromBasket.cost(mockNpc)).toThrow('NPC has no position');
  });

  // --- Tests for execute() method ---

  test('execute returns true if npc.position is missing', () => {
    Object.defineProperty(mockNpc, 'position', { value: undefined });
    expect(getFromBasket.execute(mockNpc)).toBe(true);
  });

  test('execute returns true if basket.position is missing', () => {
    Object.defineProperty(mockBasket, 'position', { value: undefined });
    expect(getFromBasket.execute(mockNpc)).toBe(true);
  });

  test('execute calls moveToOrExecute and then interact when conditions are met', () => {
    // Execute should call moveToOrExecute with basket.position, 1, and a callback.
    getFromBasket.execute(mockNpc);
    expect(mockNpc.moveToOrExecute).toHaveBeenCalledWith(
      mockBasket.position,
      1,
      expect.any(Function)
    );
    // Simulate executing the callback passed to moveToOrExecute.
    const callback = (mockNpc.moveToOrExecute as jest.Mock).mock.calls[0][2];
    callback();
    expect(mockBasket.interact).toHaveBeenCalledWith(mockNpc, 'get_item');
  });
});
