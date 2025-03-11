import { commonSetup, world, itemGenerator } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Carryable } from '../../src/items/carryable';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

afterEach(() => {
  DB.close();
});

describe('Stash and Unstash Item', () => {
  test('should stash a carried item', () => {
    const position = { x: 0, y: 0 };
    mobFactory.makeMob('player', position, 'mob1', 'TestPlayer');
    const testMob = Mob.getMob('mob1');
    expect(testMob).toBeDefined();
    const potionPosition = { x: 1, y: 1 };
    itemGenerator.createItem({
      type: 'potion',
      position: potionPosition,
      attributes: {}
    });
    const potionID = Item.getItemIDAt(potionPosition);
    expect(potionID).toBeDefined();
    const potion = Item.getItem(potionID!);
    expect(potion).toBeDefined();
    const carryablePotion = Carryable.fromItem(potion!);
    expect(carryablePotion).toBeDefined();

    carryablePotion!.pickup(testMob!);
    expect(testMob!.carrying).toBeDefined();

    const stashResult = carryablePotion!.stash(testMob!);
    expect(stashResult).toBe(true);
    expect(testMob!.carrying).toBeUndefined();
  });

  test('should unstash a stored item', () => {
    const position = { x: 0, y: 0 };
    mobFactory.makeMob('player', position, 'mob2', 'TestPlayer2');
    const testMob = Mob.getMob('mob2');
    expect(testMob).toBeDefined();

    const potionPosition = { x: 1, y: 1 };
    itemGenerator.createItem({
      type: 'potion',
      position: potionPosition,
      attributes: {}
    });
    const potionID = Item.getItemIDAt(potionPosition);
    expect(potionID).toBeDefined();
    const potion = Item.getItem(potionID!);
    expect(potion).toBeDefined();
    const carryablePotion = Carryable.fromItem(potion!);
    expect(carryablePotion).toBeDefined();

    carryablePotion!.pickup(testMob!);
    expect(testMob!.carrying).toBeDefined();
    const stashResult = carryablePotion!.stash(testMob!);
    expect(stashResult).toBe(true);
    expect(testMob!.carrying).toBeUndefined();
    carryablePotion!.unstash(testMob!);
    expect(carryablePotion).toBeDefined();
    expect(potion!.position).not.toBeDefined();
  });
  test('should return false when the mob has no position', () => {
    const testMob = Mob.getMob('mob3');

    // Mock position to undefined
    Object.defineProperty(testMob, 'position', {
      value: undefined,
      writable: true // Make sure it's writable for the test
    });

    // Create an item
    const potionPosition = { x: 1, y: 1 };
    itemGenerator.createItem({
      type: 'potion',
      position: potionPosition,
      attributes: {}
    });
    const potionID = Item.getItemIDAt(potionPosition);
    expect(potionID).toBeDefined();
    const potion = Item.getItem(potionID!);
    const carryablePotion = Carryable.fromItem(potion!);

    // Call stash and expect it to return false because the mob has no position
    const result = carryablePotion!.stash(testMob!);
    expect(result).toBe(false);
  });

  test('should return false when the mob is not carrying the item', () => {
    const testMob = Mob.getMob('mob4');

    // Ensure testMob is defined
    if (!testMob) {
      throw new Error('Test mob was not created or found');
    }

    // Create an item that the mob is not carrying
    const potionPosition = { x: 1, y: 1 };
    itemGenerator.createItem({
      type: 'potion',
      position: potionPosition,
      attributes: {}
    });
    const potionID = Item.getItemIDAt(potionPosition);
    expect(potionID).toBeDefined();
    const potion = Item.getItem(potionID!);
    const carryablePotion = Carryable.fromItem(potion!);

    // simulate a different item
    const newPosition = { x: 2, y: 2 };
    itemGenerator.createItem({
      type: 'potion',
      position: newPosition,
      attributes: {}
    });
    const newPotionID = Item.getItemIDAt(newPosition);
    expect(potionID).toBeDefined();
    const newPotion = Item.getItem(newPotionID!);

    // Set the mob's carrying item to this mock item
    testMob.carrying = newPotion; // Mob is carrying a different item

    // Call stash and expect it to return false because the mob is not carrying the item
    const result = carryablePotion!.stash(testMob!);
    expect(result).toBe(false);
  });
});
