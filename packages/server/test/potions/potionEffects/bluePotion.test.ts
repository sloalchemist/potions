import { commonSetup, world, itemGenerator } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Community } from '../../../src/community/community';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Drink } from '../../../src/items/uses/drink';
import { FantasyDate } from '../../../src/date/fantasyDate';
import { Coord } from '@rt-potion/common';
import { hexStringToNumber } from '../../../src/util/colorUtil';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blobby town');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Try to consume blue potion in various cases', () => {
  test('Test blue potion consumption back to back', () => {
    FantasyDate.initialDate();
    const position: Coord = { x: 0, y: 0 };
    const potionLocation: Coord = { x: 1, y: 0 };

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#0000ff')),
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
    expect(testMob!.carrying!.subtype).toBe(
      String(hexStringToNumber('#0000ff'))
    );

    // set initial speed
    const startSpeed = testMob!._speed;

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    for (let i = 0; i < 15; i++) {
      // 15 ticks to check stacking
      FantasyDate.runTick();
    }
    testMob?.tick(500);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // get new speed from DB
    const speed_1blue = DB.prepare(
      `
              SELECT speed FROM mobView WHERE id = :id
          `
    ).get({ id: testMob!.id }) as { speed: number };

    // check attributes on player
    expect(speed_1blue.speed).toBe(startSpeed + startSpeed * 0.5);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#0000ff')),
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
    expect(testMob!.carrying!.subtype).toBe(
      String(hexStringToNumber('#0000ff'))
    );

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check that speed is still the same (boosted from first blue bot not stacked)
    expect(testMob!._speed).toBe(startSpeed + startSpeed * 0.5);
  });

  test('Allow effects from first blue potion to wear off, then drink another', () => {
    FantasyDate.initialDate();

    const position: Coord = { x: 0, y: 0 };
    const potionLocation: Coord = { x: 1, y: 0 };

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#0000ff')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // set initial speed
    const startSpeed = testMob!._speed;

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    for (let i = 0; i < 601; i++) {
      // 600 ticks means speed has worn off
      FantasyDate.runTick();
    }
    testMob?.tick(500);

    // check attributes on player (speed should be back to normal)
    expect(testMob!._speed).toBe(startSpeed);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#0000ff')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion2 = Item.getItemIDAt(potionLocation);
    expect(potion2).not.toBeNull();
    const potionItem2 = Item.getItem(potion2!);
    expect(potionItem2).not.toBeNull();

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check attributes on player (speed should be boosted again)
    expect(testMob!._speed).toBe(startSpeed + startSpeed * 0.5);
  });
});

afterAll(() => {
  DB.close();
});
