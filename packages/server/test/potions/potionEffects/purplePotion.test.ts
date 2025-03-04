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

describe('Try to consume purple potion in various cases', () => {
  test('Test purple potion stacking', () => {
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
      subtype: String(hexStringToNumber('#ab00e7')),
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
      String(hexStringToNumber('#ab00e7'))
    );

    // set initial defense
    const startDefense = testMob!._defense;

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player (should be boosted)
    expect(testMob!._defense).toBe(startDefense + startDefense * 0.5);

    // create another potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#ab00e7')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion2 = Item.getItemIDAt(potionLocation);
    const potionItem2 = Item.getItem(potion2!);

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check attributes on player (should be boosted)
    expect(testMob!._defense).toBe(startDefense + startDefense * 0.5);

    for (let i = 0; i < 250; i++) {
      // let the effect run out
      FantasyDate.runTick();
    }
    testMob?.tick(500);

    // should return to default defense
    expect(testMob!._defense).toBe(startDefense);
  });

  test('Test purple potion in combat', () => {
    FantasyDate.initialDate();

    const playerPosition: Coord = { x: 0, y: 0 };
    const enemyPosition: Coord = { x: 0, y: 1 };
    const potionLocation: Coord = { x: 1, y: 0 };

    // create a fight initiator (blob -> hunt)
    mobFactory.makeMob('blob', playerPosition, 'TestingID', 'TestAttacker');
    const testAttacker = Mob.getMob('TestingID');
    expect(testAttacker).not.toBeNull();

    // create a enemy (player)
    mobFactory.makeMob('player', enemyPosition, 'TestEnemyID', 'TestEnemy');
    const testEnemy = Mob.getMob('TestEnemyID');
    expect(testEnemy).not.toBeNull();

    // make the blob fight the player (due to low favorability)
    Community.makeFavor('alchemists', 'blobs', -100);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#ab00e7')),
      position: potionLocation,
      carriedBy: testAttacker
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // this inits the first attack
    testAttacker?.tick(500);
    testEnemy?.tick(500);
    expect(testAttacker!.action).toBe('hunt');

    // grab health of enemy, make sure it has changed
    const healthWithBaseDefense = testEnemy!.health;
    expect(healthWithBaseDefense).toBeLessThan(testEnemy!._maxHealth);

    // heal enemy so we can register another tick of damage
    testEnemy?.changeHealth(testEnemy!._maxHealth - testEnemy!.health);

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testEnemy!, potionItem!);
    expect(test).toBe(true);

    // allow attack for a tick
    testAttacker?.tick(500);
    testEnemy?.tick(500);

    // grab health of enemy after defense pot and damage taken
    const healthWithMoreDefense = testEnemy!.health;
    expect(healthWithMoreDefense).not.toBe(testEnemy!._maxHealth);

    // check attributes on enemy
    expect(healthWithBaseDefense).toBeLessThan(healthWithMoreDefense);
  });
});

describe('Try to consume undefined potions that are similar to purple potions', () => {
  test('Test weak purple potion effect', () => {
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
      subtype: String(hexStringToNumber('#8900c5')),
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
      String(hexStringToNumber('#8900c5'))
    );

    // set initial defense
    const startDefense = testMob!._defense;

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player (should be boosted)
    expect(testMob!._defense).toBe(startDefense + startDefense * 0.5 * 0.5);
  });

  test('Test super weak purple potion effect', () => {
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
      subtype: String(hexStringToNumber('#8966c5')),
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
      String(hexStringToNumber('#8966c5'))
    );

    // set initial defense
    const startDefense = testMob!._defense;

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player (should be boosted)
    expect(testMob!._defense).toBe(startDefense + startDefense * 0.5 * 0.3);
  });
});

afterAll(() => {
  DB.close();
});
