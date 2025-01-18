import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { Drink } from '../../src/items/uses/drink';

beforeEach(() => {
  commonSetup();
  mobFactory.loadTemplates(world.mobTypes);
  Community.makeVillage('alchemists', 'Alchemists guild');
});

describe('Try to consume blue potion in various cases', () => {
  test('Create player, consume blue potion, then check attributes', () => {

    const position = { x: 0, y: 0 };

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: { x: 1, y: 0 },
      carriedBy: testMob
    });
    const potion = Item.getItemIDAt({ x: 1, y: 0 });
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testMob!.carrying!.subtype).toBe('255');

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player
    expect(testMob!._speed).toBe(4.5);
    expect(testMob!.health).toBe(100);
    expect(testMob!.gold).toBe(0);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: { x: 1, y: 0 },
      carriedBy: testMob
    });
    const potion2 = Item.getItemIDAt({ x: 1, y: 0 });
    expect(potion2).not.toBeNull();
    const potionItem2 = Item.getItem(potion2!);
    expect(potionItem2).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testMob!.carrying!.subtype).toBe('255');

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player
    expect(testMob!._speed).toBe(6.5);
    expect(testMob!.health).toBe(100);
    expect(testMob!.gold).toBe(0);
  });

  test('Create player with near max speed, consume blue potion, then check attributes', () => {

    const position = { x: 0, y: 0 };

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: { x: 1, y: 0 },
      carriedBy: testMob
    });
    const potion = Item.getItemIDAt({ x: 1, y: 0 });
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testMob!.carrying!.subtype).toBe('255');

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();


    // 2.5 + 6.5 = 9 speed
    testMob?.changeSpeed(6.5)


    // check attributes on player, make sure 10 is cap for speed
    console.log(testMob!._speed)
    expect(testMob!._speed).toBe(10);
    expect(testMob!.health).toBe(100);
    expect(testMob!.gold).toBe(0);
  });
});

afterAll(() => {
  DB.close();
});
