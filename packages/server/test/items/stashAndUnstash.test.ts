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
    expect(potion!.position).toBeDefined();
    expect(typeof potion!.position!.x).toBe('number');
    expect(typeof potion!.position!.y).toBe('number');
  });
});