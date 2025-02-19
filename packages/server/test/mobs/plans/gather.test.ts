import { Gather } from '../../../src/mobs/plans/gather';
import { Container } from '../../../src/items/container';
import { logistic } from '../../../src/util/mathUtil';
import { Mob } from '../../../src/mobs/mob';
import { PersonalityTraits } from '../../../src/mobs/traits/personality';
import { Item } from '../../../src/items/item';

jest.mock('../../../src/items/container', () => ({
  Container: {
    fromItem: jest.fn()
  }
}));

jest.mock('../../../src/util/mathUtil', () => ({
  logistic: jest.fn()
}));

describe('Gather', () => {
  let dummyBasket: Item;
  let gather: Gather;
  const itemType = 'apple';
  const bonus = 10;

  beforeEach(() => {
    // Create a dummy basket with the required type "basket"
    dummyBasket = { type: 'basket' } as Item;
    // Reset the mocks for each test
    (Container.fromItem as jest.Mock).mockReset();
    (logistic as jest.Mock).mockReset();
  });

  test('constructor should throw error if basket type is not "basket"', () => {
    const badBasket = { type: 'not_basket' } as Item;
    expect(() => new Gather(itemType, bonus, badBasket)).toThrow(
      'Gather action requires a basket'
    );
  });

  test('constructor should create an instance correctly', () => {
    gather = new Gather(itemType, bonus, dummyBasket);
    expect(gather.description()).toBe(`gathering a ${itemType}`);
    expect(gather.reaction()).toBe(`Gathering ${itemType}!`);
    expect(gather.type()).toBe('gather');
  });

  test('benefit should throw error if Container.fromItem returns null', () => {
    gather = new Gather(itemType, bonus, dummyBasket);
    (Container.fromItem as jest.Mock).mockReturnValue(null);
    const dummyMob = {
      personality: {
        traits: {
          [PersonalityTraits.Industriousness]: 2
        }
      }
    } as Mob;
    expect(() => gather.benefit(dummyMob)).toThrow('Basket has no container');
  });

  test('benefit should calculate utility correctly', () => {
    gather = new Gather(itemType, bonus, dummyBasket);
    // Create a mock container with specific inventory and capacity values
    const containerMock = {
      getInventory: jest.fn(() => 2), // e.g., 2 items in inventory
      getCapacity: jest.fn(() => 10) // capacity is 10
    };
    (Container.fromItem as jest.Mock).mockReturnValue(containerMock);
    // For percentFull = 2/10 = 0.2, let logistic return 0.3 so that:
    // percentFullAdjustment = 1 - 0.3 = 0.7
    (logistic as jest.Mock).mockReturnValue(0.3);

    const dummyMob = {
      personality: {
        traits: {
          [PersonalityTraits.Industriousness]: 2 // For example, 2
        }
      }
    } as Mob;
    // Expected utilityLevel = 0.7 * bonus * 2 = 0.7 * 10 * 2 = 14
    expect(gather.benefit(dummyMob)).toBeCloseTo(14);
  });

  test('description should return correct string', () => {
    gather = new Gather(itemType, bonus, dummyBasket);
    expect(gather.description()).toBe(`gathering a ${itemType}`);
  });

  test('reaction should return correct string', () => {
    gather = new Gather(itemType, bonus, dummyBasket);
    expect(gather.reaction()).toBe(`Gathering ${itemType}!`);
  });

  test('type should return "gather"', () => {
    gather = new Gather(itemType, bonus, dummyBasket);
    expect(gather.type()).toBe('gather');
  });
});
