import { EnterPortal } from '../../src/items/uses/enterPortal';
import { Mob } from '../../src/mobs/mob';
import { Item } from '../../src/items/item';

describe('EnterPortal', () => {
  let enterPortal: EnterPortal;
  let testMob: Mob;
  let testItem: Item;

  beforeEach(() => {
    enterPortal = new EnterPortal();
    testMob = {} as Mob;
    testItem = {} as Item;
  });

  test('should return false because no interaction between worlds', () => {
    const result = enterPortal.interact(testMob, testItem);
    expect(result).toBe(false);
  });
});
