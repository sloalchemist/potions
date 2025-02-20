import { Pickup } from '../../../src/items/uses/pickup';
import { Mob } from '../../../src/mobs/mob';
import { Item } from '../../../src/items/item';
import { Carryable } from '../../../src/items/carryable';

describe('Pickup', () => {
  let pickup: Pickup;
  let mockMob: Mob;
  let mockItem: Item;
  let mockItem2: Item;
  let mockCarryable: Carryable;

  beforeEach(() => {
    pickup = new Pickup();
    mockMob = {
      carrying: null,
      changeGold: jest.fn()
    } as unknown as Mob;

    mockItem = {
      position: { x: 0, y: 0 },
      type: 'item',
      getAttribute: jest.fn().mockReturnValue(10),
      destroy: jest.fn()
    } as unknown as Item;

    mockItem2 = {
      position: { x: 1, y: 1 },
      type: 'item',
      getAttribute: jest.fn().mockReturnValue(10),
      destroy: jest.fn()
    } as unknown as Item;

    mockCarryable = {
      pickup: jest.fn(),
      dropAtFeet: jest.fn()
    } as unknown as Carryable;

    jest.spyOn(Carryable, 'fromItem').mockReturnValue(mockCarryable);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pick up a carryable item', () => {
    const result = pickup.interact(mockMob, mockItem);
    expect(result).toBe(true);
    expect(mockCarryable.pickup).toHaveBeenCalledWith(mockMob);
  });

  it('should drop currently carried item before picking up a new one', () => {
    mockMob.carrying = mockItem;
    const result = pickup.interact(mockMob, mockItem2);
    expect(result).toBe(true);
    expect(mockCarryable.dropAtFeet).toHaveBeenCalledWith(mockMob);
    expect(mockCarryable.pickup).toHaveBeenCalledWith(mockMob);
  });
});
