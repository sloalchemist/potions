import { UseItem } from '../../../../src/mobs/plans/means/useItem';
import { Mob } from '../../../../src/mobs/mob';
import { Item } from '../../../../src/items/item';

describe('UseItem', () => {
  let mockNpc: jest.Mocked<Mob>;
  let mockItem: jest.Mocked<Item>;
  let useItem: UseItem;

  beforeEach(() => {
    mockNpc = {
      position: { x: 5, y: 5 },
      carrying: null
    } as unknown as jest.Mocked<Mob>;

    mockItem = {
      type: 'potion',
      interact: jest.fn()
    } as unknown as jest.Mocked<Item>;

    useItem = new UseItem(['potion'], 'drink');
  });

  test('execute returns true if npc.position is missing', () => {
    Object.defineProperty(mockNpc, 'position', { value: undefined });
    expect(useItem.execute(mockNpc)).toBe(true);
  });

  test('execute returns true if npc is not carrying an item', () => {
    expect(useItem.execute(mockNpc)).toBe(true);
  });

  test('execute calls interact when npc is carrying a valid item', () => {
    Object.defineProperty(mockNpc, 'carrying', { value: mockItem });

    expect(useItem.execute(mockNpc)).toBe(true);
    expect(mockItem.interact).toHaveBeenCalledWith(mockNpc, 'drink');
  });

  test('cost throws an error if npc has no position', () => {
    Object.defineProperty(mockNpc, 'position', { value: undefined });
    expect(() => useItem.cost(mockNpc)).toThrow('NPC has no position');
  });

  test('cost returns Infinity if npc is not carrying an item', () => {
    expect(useItem.cost(mockNpc)).toBe(Infinity);
  });

  test('cost returns 0 if npc is carrying a valid item', () => {
    Object.defineProperty(mockNpc, 'carrying', { value: mockItem });
    expect(useItem.cost(mockNpc)).toBe(0);
  });

  test('cost returns Infinity if npc is carrying an invalid item', () => {
    const invalidItem = { type: 'weapon' } as unknown as jest.Mocked<Item>;
    Object.defineProperty(mockNpc, 'carrying', { value: invalidItem });

    expect(useItem.cost(mockNpc)).toBe(Infinity);
  });
});
