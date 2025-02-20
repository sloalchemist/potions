import { BottlePotion } from '../../src/items/uses/cauldron/bottlePotion';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { commonSetup, world, itemGenerator } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Coord } from '@rt-potion/common';
import { Community } from '../../src/community/community';
import { UsesRegistry } from '../../src/items/uses/usesRegistry';
import { DB } from '../../src/services/database';

// Mock UsesRegistry.load() to prevent it from trying to instantiate all use classes
jest.spyOn(UsesRegistry, 'load').mockImplementation(() => {});

describe('BottlePotion', () => {
  beforeEach(() => {
    commonSetup();
    Community.makeVillage('alchemists', 'Alchemists guild');
    mobFactory.loadTemplates(world.mobTypes);
  });

  afterEach(() => {
    DB.close();
  });

  test('should have key as "bottle_potion"', () => {
    const bottlePotion = new BottlePotion();
    expect(bottlePotion.key).toBe('bottle_potion');
  });

  test('should return "Bottle Potion" as description', () => {
    const bottlePotion = new BottlePotion();
    const mob = createTestMob();
    const cauldron = createTestCauldron();
    expect(bottlePotion.description(mob, cauldron)).toBe('Bottle Potion');
  });

  test('should successfully bottle potion', () => {
    const bottlePotion = new BottlePotion();
    const mob = createTestMob();
    const cauldron = createTestCauldron();

    const result = bottlePotion.interact(mob, cauldron);

    expect(result).toBe(true);
    expect(cauldron.getAttribute('ingredients')).toBe(0);
    expect(cauldron.getAttribute('potion_subtype')).toBe(0);
    expect(mob.carrying).toBeTruthy();
    if (mob.carrying) {
      expect(mob.carrying.type).toBe('potion');
      expect(Number(mob.carrying.subtype)).toBe(16711680);
    }
  });

  test('should fail if mob has no position', () => {
    const bottlePotion = new BottlePotion();
    const mob = createTestMob();
    const cauldron = createTestCauldron();

    Object.defineProperty(mob, 'position', {
      get: () => undefined,
      configurable: true
    });

    const result = bottlePotion.interact(mob, cauldron);

    expect(result).toBe(false);
    expect(cauldron.getAttribute('ingredients')).toBe(1);
    expect(cauldron.getAttribute('potion_subtype')).toBe(16711680);
    expect(mob.carrying).toBeFalsy();
  });

  test('should fail if item is not a cauldron', () => {
    const bottlePotion = new BottlePotion();
    const mob = createTestMob();

    // Create and retrieve the non-cauldron item properly
    const nonCauldronPos: Coord = { x: 2, y: 2 };
    itemGenerator.createItem({
      type: 'potion',
      position: nonCauldronPos
    });
    const nonCauldronId = Item.getItemIDAt(nonCauldronPos);
    const nonCauldron = Item.getItem(nonCauldronId!)!;

    const result = bottlePotion.interact(mob, nonCauldron);

    expect(result).toBe(false);
  });

  test('should fail if cauldron has no potion', () => {
    const bottlePotion = new BottlePotion();
    const mob = createTestMob();
    const cauldron = createTestCauldron();

    cauldron.setAttribute('ingredients', 0);
    cauldron.setAttribute('potion_subtype', 0);

    const result = bottlePotion.interact(mob, cauldron);

    expect(result).toBe(false);
    expect(mob.carrying).toBeFalsy();
  });

  test('should fail if mob is already carrying something', () => {
    const bottlePotion = new BottlePotion();
    const mob = createTestMob();
    const cauldron = createTestCauldron();

    // Create and retrieve the carried item properly
    const carriedItemPos: Coord = { x: 0, y: 0 };
    itemGenerator.createItem({
      type: 'potion',
      position: carriedItemPos,
      carriedBy: mob
    });
    const carriedItemId = Item.getItemIDAt(carriedItemPos);
    const carriedItem = Item.getItem(carriedItemId!)!;

    const result = bottlePotion.interact(mob, cauldron);

    expect(result).toBe(false);
    expect(cauldron.getAttribute('ingredients')).toBe(1);
    expect(cauldron.getAttribute('potion_subtype')).toBe(16711680);
    expect(mob.carrying).toStrictEqual(carriedItem);
  });
});

// Helper functions
function createTestMob(): Mob {
  const mobPos: Coord = { x: 0, y: 0 };
  mobFactory.makeMob('player', mobPos, 'test-mob', 'Test Mob', 'alchemists');
  return Mob.getMob('test-mob')!;
}

function createTestCauldron(): Item {
  const cauldronPos: Coord = { x: 1, y: 1 };
  itemGenerator.createItem({
    type: 'cauldron',
    position: cauldronPos,
    attributes: {
      ingredients: 1,
      potion_subtype: 16711680, // Red potion
      color_weight: 1
    }
  });
  const cauldronId = Item.getItemIDAt(cauldronPos);
  return Item.getItem(cauldronId!)!;
}
