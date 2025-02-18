import { Stash } from '../../../src/items/uses/stash';
import { Unstash } from '../../../src/items/uses/unstash';
import { Carryable } from '../../../src/items/carryable';
import { Mob } from '../../../src/mobs/mob';
import { Item } from '../../../src/items/item';

jest.mock('../../../src/items/carryable', () => ({
  Carryable: {
    fromItem: jest.fn(),
  }
}));

describe('Stash Use', () => {
  let stashUse: Stash;
  let mockCarryable: { stash: jest.Mock };
  let mob: Partial<Mob>;
  let item: Partial<Item>;

  beforeEach(() => {
    stashUse = new Stash();
    mockCarryable = {
      stash: jest.fn()
    };
    (Carryable.fromItem as jest.Mock).mockReturnValue(mockCarryable);
    mob = { carrying: undefined };
    item = { id: 'test-id' } as Partial<Item>;
  });

  it('should return false if mob is not carrying any item', () => {
    const result = stashUse.interact(mob as Mob, item as Item);
    expect(result).toBe(false);
    expect(mockCarryable.stash).not.toHaveBeenCalled();
  });

  it('should return false if mob is carrying a different item', () => {
    mob.carrying = { id: 'different-id' } as Item;
    const result = stashUse.interact(mob as Mob, item as Item);
    expect(result).toBe(false);
    expect(mockCarryable.stash).not.toHaveBeenCalled();
  });

  it('should call stash and return true if mob is carrying the same item', () => {
    mob.carrying = item as Item;
    const result = stashUse.interact(mob as Mob, item as Item);
    expect(result).toBe(true);
    expect(mockCarryable.stash).toHaveBeenCalledWith(mob);
  });
});

describe('Unstash Use', () => {
  let unstashUse: Unstash;
  let mockCarryable: { unstash: jest.Mock };
  let mob: Partial<Mob>;
  let item: Partial<Item>;

  beforeEach(() => {
    unstashUse = new Unstash();
    mockCarryable = {
      unstash: jest.fn()
    };
    (Carryable.fromItem as jest.Mock).mockReturnValue(mockCarryable);
    mob = { carrying: undefined };
    item = { id: 'test-id' } as Partial<Item>;
  });

  it('should call unstash and return true', () => {
    const result = unstashUse.interact(mob as Mob, item as Item);
    expect(result).toBe(true);
    expect(mockCarryable.unstash).toHaveBeenCalledWith(mob);
  });
});