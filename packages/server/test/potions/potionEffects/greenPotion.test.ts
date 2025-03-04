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

describe('Try to consume green potion in various cases', () => {
  test('Test green potion stacking', () => {
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
      subtype: String(hexStringToNumber('#00ff00')),
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
      String(hexStringToNumber('#00ff00'))
    );

    // set initial dot
    const startDOT = testMob!.damageOverTime;

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player (dot should be 1 now)
    expect(testMob!.damageOverTime).toBe(startDOT + 1);

    // create another potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#00ff00')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion2 = Item.getItemIDAt(potionLocation);
    const potionItem2 = Item.getItem(potion2!);

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check attributes on player (shouldn't change)
    expect(testMob!.damageOverTime).toBe(startDOT + 1);

    for (let i = 0; i < 250; i++) {
      // let the effect run out
      FantasyDate.runTick();
    }
    testMob?.tick(500);

    // should return to default defense (should be 0)
    expect(testMob!.damageOverTime).toBe(startDOT);
  });

  test('Test green potion in combat', () => {
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
      subtype: String(hexStringToNumber('#00ff00')),
      position: potionLocation,
      carriedBy: testAttacker
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // have the attacker drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testAttacker!, potionItem!);
    expect(test).toBe(true);

    // grab health of enemy, see if it has started yet or we need one more tick
    const initEnemyHealth = testEnemy!.health;
    expect(initEnemyHealth).toBe(testEnemy!._maxHealth);

    // go through ticks to ensure attacker is in range and attacking
    testAttacker?.tick(500);
    testEnemy?.tick(500);
    FantasyDate.runTick();
    expect(testAttacker!.action).toBe('hunt');

    // check effects
    expect(testAttacker!.damageOverTime).toBe(1);
    expect(testEnemy!.poisoned).toBe(1);

    // kill attacker so poison is the only thing doing damage
    testAttacker?.destroy();

    // grab health of enemy, make sure it has changed
    const firstEnemyHealth = testEnemy!.health;
    expect(firstEnemyHealth).toBeLessThan(testEnemy!._maxHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should have decreased again
    const secondEnemyHealth = testEnemy!.health;
    expect(secondEnemyHealth).toBeLessThan(firstEnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should have decreased again
    const thirdEnemyHealth = testEnemy!.health;
    expect(thirdEnemyHealth).toBeLessThan(secondEnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should have decreased again
    const fourthEnemyHealth = testEnemy!.health;
    expect(fourthEnemyHealth).toBeLessThan(thirdEnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should have decreased again
    const fifthEnemyHealth = testEnemy!.health;
    expect(fifthEnemyHealth).toBeLessThan(fourthEnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should be the same (effect ran out)
    const sixthEnemyHealth = testEnemy!.health;
    expect(sixthEnemyHealth).toBe(fifthEnemyHealth);

    // should have run out now
    expect(testEnemy!.poisoned).toBe(0);
  });

  test('Test green potion in combat (2 attacks, 6 ticks total)', () => {
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
      subtype: String(hexStringToNumber('#00ff00')),
      position: potionLocation,
      carriedBy: testAttacker
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // have the attacker drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testAttacker!, potionItem!);
    expect(test).toBe(true);

    // grab health of enemy, see if it has started yet or we need one more tick
    const initEnemyHealth = testEnemy!.health;
    expect(initEnemyHealth).toBe(testEnemy!._maxHealth);

    // go through ticks to ensure attacker is in range and attacking
    testAttacker?.tick(500);
    testEnemy?.tick(500);
    FantasyDate.runTick();
    expect(testAttacker!.action).toBe('hunt');

    // check effects
    expect(testAttacker!.damageOverTime).toBe(1);
    expect(testEnemy!.poisoned).toBe(1);

    // one tick of attacking should have ben registered
    const init2EnemyHealth = testEnemy!.health;
    expect(init2EnemyHealth).toBeLessThan(testEnemy!._maxHealth);

    // go through ticks to ensure attacker is in range and attacking
    testAttacker?.tick(500);
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // check effects (should still be 1)
    expect(testAttacker!.damageOverTime).toBe(1);
    expect(testEnemy!.poisoned).toBe(1);

    // kill attacker so poison is the only thing doing damage
    testAttacker?.destroy();

    // grab health of enemy, make sure it has changed
    const firstEnemyHealth = testEnemy!.health;
    expect(firstEnemyHealth).toBeLessThan(init2EnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should have decreased again
    const secondEnemyHealth = testEnemy!.health;
    expect(secondEnemyHealth).toBeLessThan(firstEnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should have decreased again
    const thirdEnemyHealth = testEnemy!.health;
    expect(thirdEnemyHealth).toBeLessThan(secondEnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should have decreased again
    const fourthEnemyHealth = testEnemy!.health;
    expect(fourthEnemyHealth).toBeLessThan(thirdEnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should have decreased again
    const fifthEnemyHealth = testEnemy!.health;
    expect(fifthEnemyHealth).toBeLessThan(fourthEnemyHealth);

    // run a tick
    testEnemy?.tick(500);
    FantasyDate.runTick();

    // health should be the same (effect ran out)
    const sixthEnemyHealth = testEnemy!.health;
    expect(sixthEnemyHealth).toBe(fifthEnemyHealth);

    // should have run out now
    expect(testEnemy!.poisoned).toBe(0);
  });
});

// BLACK POTION TEST

describe('Try to consume black potion in various cases', () => {
  test('Spawn and kill monster with a black potion', () => {
    FantasyDate.initialDate();

    const playerPosition: Coord = { x: 0, y: 0 };
    const potionLocation: Coord = { x: 1, y: 0 };

    // create a fight initiator (blob -> hunt)
    mobFactory.makeMob('player', playerPosition, 'TestingID', 'MonsterSpawner');
    const testMob = Mob.getMob('TestingID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#166060')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the initiator is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testMob!.carrying!.subtype).toBe(
      String(hexStringToNumber('#166060'))
    );

    // have the attacker drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check that monster exists
    const monster = Mob.getMob('Monster');
    expect(monster).not.toBeNull();

    //wait to make the monster time out
    // run ticks
    for (let i = 0; i < 120; i++) {
      FantasyDate.runTick();
    }
    monster?.tick(500);

    // check to make sure monster is dead
    const deadMonster = Mob.getMob('Monster');
    expect(deadMonster?.action).toBe('destroyed');
  });
});

afterAll(() => {
  DB.close();
});
