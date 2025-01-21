import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { Drink } from '../../src/items/uses/drink';
import { FantasyDate } from '../../src/date/fantasyDate';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Try to consume blue potion in various cases', () => {
  test('Create player, consume blue potion, then check attributes', () => {
    FantasyDate.initialDate();
    
    const position: Coord = { x: 0, y: 0 };
    const potionLocation: Coord = { x: 1, y: 0 }

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: potionLocation,
      carriedBy: testMob
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testMob!.carrying!.subtype).toBe('255');

    // have the player drink the potion
    const testDrink = new Drink();
    const target_tick = FantasyDate.currentDate().global_tick + 30;
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player
    expect(testMob!._speed).toBe(4.5);
    expect(testMob!.health).toBe(100);
    expect(testMob!.gold).toBe(0);
    expect(testMob!._target_speed_tick).toBe(target_tick);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: potionLocation,
      carriedBy: testMob
    });
    const potion2 = Item.getItemIDAt(potionLocation);
    expect(potion2).not.toBeNull();
    const potionItem2 = Item.getItem(potion2!);
    expect(potionItem2).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testMob!.carrying!.subtype).toBe('255');

    // have the player drink the potion
    const testDrink2 = new Drink();
    const target_tick2 = FantasyDate.currentDate().global_tick + 30;
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player
    expect(testMob!._speed).toBe(4.5);
    expect(testMob!.health).toBe(100);
    expect(testMob!.gold).toBe(0);
    expect(testMob!._target_speed_tick).toBe(target_tick2);
  });
});

afterAll(() => {
  DB.close();
});
