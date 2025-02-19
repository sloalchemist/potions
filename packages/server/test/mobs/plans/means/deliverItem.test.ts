import { DeliverItem } from '../../../../src/mobs/plans/means/deliverItem';
import { Mob } from '../../../../src/mobs/mob';
import { Item } from '../../../../src/items/item';

describe('DeliverItem', () => {
  let deliverItem: DeliverItem;
  let mockBasket: Item;
  let mockNpc: Mob;

  beforeEach(() => {
    // Mock the basket position and interact method.
    mockBasket = {
      position: { x: 5, y: 5 },
      interact: jest.fn()
    } as unknown as Item;

    // Create a mock NPC and mock the position as a getter.
    mockNpc = {
      get position() {
        return { x: 1, y: 1 };
      },
      set position(value) {
        // This will allow mocking the position getter/setter if needed.
      },
      moveToOrExecute: jest.fn(),
      carrying: undefined
    } as unknown as Mob;

    deliverItem = new DeliverItem(mockBasket, 'potion');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    test('returns true if basket position is missing', () => {
      mockBasket.position = undefined;
      const result = deliverItem.execute(mockNpc);
      expect(result).toBe(true);
    });

    test('calls moveToOrExecute and basket.interact when positions exist', () => {
      // Simulate a successful moveToOrExecute:
      (mockNpc.moveToOrExecute as jest.Mock).mockImplementation(
        (pos, dist, callback) => {
          // Call the callback (which should trigger basket.interact)
          callback();
          return true;
        }
      );

      const result = deliverItem.execute(mockNpc);
      expect(mockNpc.moveToOrExecute).toHaveBeenCalledWith(
        mockBasket.position,
        1,
        expect.any(Function)
      );
      expect(mockBasket.interact).toHaveBeenCalledWith(mockNpc, 'add_item');
      expect(result).toBe(true);
    });

    test('returns false if moveToOrExecute returns false', () => {
      (mockNpc.moveToOrExecute as jest.Mock).mockReturnValue(false);
      const result = deliverItem.execute(mockNpc);
      expect(result).toBe(false);
    });
  });

  describe('cost', () => {
    test('returns 0 if NPC is carrying an item of the correct type', () => {
      // Set npc.carrying to an item with type matching deliverItem's expected type.
      mockNpc.carrying = {
        id: '123',
        itemType: 'potion',
        drops_item: true,
        attributes: [],
        type: 'potion'
      } as unknown as Item;
      const result = deliverItem.cost(mockNpc);
      expect(result).toBe(0);
    });

    test('returns Infinity if NPC is carrying an item of a different type', () => {
      // Set npc.carrying to an item with a different type.
      mockNpc.carrying = {
        id: '123',
        itemType: 'sword',
        drops_item: true,
        attributes: [],
        type: 'sword'
      } as unknown as Item;
      const result = deliverItem.cost(mockNpc);
      expect(result).toBe(Infinity);
    });

    test('returns Infinity if NPC is not carrying any item', () => {
      // Ensure npc.carrying is undefined.
      mockNpc.carrying = undefined;
      const result = deliverItem.cost(mockNpc);
      expect(result).toBe(Infinity);
    });
  });
});
