import { EnterPortal } from '../../src/items/uses/enterPortal';
import { Mob } from '../../src/mobs/mob';
import { Item } from '../../src/items/item';
import { pubSub } from '../../src/services/clientCommunication/pubsub';

jest.mock('../../src/services/clientCommunication/pubsub', () => ({
  pubSub: {
    showPortalMenu: jest.fn()
  }
}));

describe('EnterPortal', () => {
  let enterPortal: EnterPortal;
  let testMob: Mob;
  let testItem: Item;

  beforeEach(() => {
    enterPortal = new EnterPortal();
    testMob = {
      id: '123',
      position: { x: 0, y: 0 },
      setInPortalMenu: jest.fn()
    } as unknown as Mob;
    testItem = {
      position: { x: 0, y: 0 }
    } as Item;
    jest.clearAllMocks();
  });

  test('should return true and call showPortalMenu when mob is near portal', () => {
    const result = enterPortal.interact(testMob, testItem);

    expect(result).toBe(true);
    expect(pubSub.showPortalMenu).toHaveBeenCalledWith(
      testMob.id,
      enterPortal.worlds
    );
    expect(testMob.setInPortalMenu).toHaveBeenCalledWith(true);
  });
});
