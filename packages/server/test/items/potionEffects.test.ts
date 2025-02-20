import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { Drink } from '../../src/items/uses/drink';
import { FantasyDate } from '../../src/date/fantasyDate';
import { Coord } from '@rt-potion/common';
import { hexStringToNumber } from '../../src/util/colorUtil';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blobby town');
  mobFactory.loadTemplates(world.mobTypes);
});

// BLUE POTION TESTS

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

// ORANGE POTION TESTS

describe('Try to consume orange potion in various cases', () => {
  test('Test orange potion consumption back to back', () => {
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
      subtype: String(hexStringToNumber('#e79600')),
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
      String(hexStringToNumber('#e79600'))
    );

    // set initial attack
    const startAttack = testMob!._attack; // should be 5 at default

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

    // check attributes on player (should be boosted)
    expect(testMob!._attack).toBe(startAttack + startAttack * 0.5);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#e79600')),
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
      String(hexStringToNumber('#e79600'))
    );

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player (attack should be still boosted but not stacked)
    expect(testMob!._attack).toBe(startAttack + startAttack * 0.5);
  });

  test('Allow effects from first orange potion to wear off, then drink another', () => {
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
      subtype: String(hexStringToNumber('#e79600')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // set initial attack
    const startAttack = testMob!._attack;

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    for (let i = 0; i < 241; i++) {
      // 240 ticks means attack has worn off
      FantasyDate.runTick();
    }
    testMob?.tick(500);

    // check attributes on player (should be back to normal)
    expect(testMob!._attack).toBe(startAttack);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#e79600')),
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

    // check attributes on player (should be boosted again)
    expect(testMob!._attack).toBe(startAttack + startAttack * 0.5);
  });
});

// GOLD POTION TESTS

describe('Try to consume gold potion in various cases', () => {
  test('Test gold potion consumption back to back', () => {
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
      subtype: String(hexStringToNumber('#ef7d55')),
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
      String(hexStringToNumber('#ef7d55'))
    );

    // set initial max health
    const startMaxHealth = testMob!._maxHealth;

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

    // check attributes on player (should be boosted)
    expect(testMob!._maxHealth).toBe(startMaxHealth + 20);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#ef7d55')),
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
      String(hexStringToNumber('#ef7d55'))
    );

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // should boost again
    expect(testMob!._maxHealth).toBe(startMaxHealth + 20 * 2);

    // create 3 more potions and drink them all
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#ef7d55')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion3 = Item.getItemIDAt(potionLocation);
    const potionItem3 = Item.getItem(potion3!);
    const testDrink3 = new Drink();
    testDrink3.interact(testMob!, potionItem3!);
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#ef7d55')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion4 = Item.getItemIDAt(potionLocation);
    const potionItem4 = Item.getItem(potion4!);
    const testDrink4 = new Drink();
    testDrink4.interact(testMob!, potionItem4!);
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#ef7d55')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion5 = Item.getItemIDAt(potionLocation);
    const potionItem5 = Item.getItem(potion5!);
    const testDrink5 = new Drink();
    testDrink5.interact(testMob!, potionItem5!);

    // should all have applied increases to max health (5 total now)
    expect(testMob!._maxHealth).toBe(startMaxHealth + 20 * 5);

    // make one more potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#ef7d55')),
      position: potionLocation,
      carriedBy: testMob
    });
    const potion6 = Item.getItemIDAt(potionLocation);
    const potionItem6 = Item.getItem(potion6!);

    // drink 6th potion
    const testDrink6 = new Drink();
    testDrink6.interact(testMob!, potionItem6!);

    // should see no difference from last increase (capped at 5 effects)
    expect(testMob!._maxHealth).toBe(startMaxHealth + 20 * 5);
  });
});

// GREY POTION TESTS

describe('Try to consume grey potion in various cases', () => {
  test('Test grey potion consumption back to back', () => {
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
      subtype: String(hexStringToNumber('#8b7f6e')),
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
      String(hexStringToNumber('#8b7f6e'))
    );

    // set initial slowEnemy
    const startSlowEnemy = 0; // should be 0 at default

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

    // get new slowEnemy from DB
    const slowEnemy_boosted = DB.prepare(
      `
            SELECT slowEnemy FROM mobs WHERE id = :id
        `
    ).get({ id: testMob!.id }) as { slowEnemy: number };

    // check slowEnemy count on player (should be boosted)
    expect(slowEnemy_boosted.slowEnemy).toBe(startSlowEnemy + 1);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#8b7f6e')),
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
      String(hexStringToNumber('#8b7f6e'))
    );

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    for (let i = 0; i < 15; i++) {
      // 15 ticks to check stacking
      FantasyDate.runTick();
    }
    testMob?.tick(500);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // get new slowEnemy from DB
    const slowEnemy_stacked = DB.prepare(
      `
            SELECT slowEnemy FROM mobs WHERE id = :id
        `
    ).get({ id: testMob!.id }) as { slowEnemy: number };

    // check attributes on player
    expect(slowEnemy_stacked.slowEnemy).toBe(slowEnemy_boosted.slowEnemy + 1);
  });

  test('Fight a target and have the grey potion debuff apply to the target', () => {
    FantasyDate.initialDate();

    const playerPosition: Coord = { x: 0, y: 0 };
    const enemyPosition: Coord = { x: 1, y: 1 };
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
      subtype: String(hexStringToNumber('#8b7f6e')),
      position: potionLocation,
      carriedBy: testAttacker
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // set initial slowEnemy
    const startSlowEnemy = 0; // should be 0 at default

    // get start enemy speed
    const startEnemySpeed = testEnemy!._speed;

    // ensure the initiator is carrying the potion
    expect(testAttacker!.carrying).not.toBeNull();
    expect(testAttacker!.carrying!.type).toBe('potion');
    expect(testAttacker!.carrying!.subtype).toBe(
      String(hexStringToNumber('#8b7f6e'))
    );

    // have the attacker drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testAttacker!, potionItem!);
    expect(test).toBe(true);

    // run ticks
    testAttacker?.tick(500);
    testEnemy?.tick(500);

    // check to make sure potion is not being carried
    expect(testAttacker!.carrying).toBeUndefined();

    // make sure the fight initiator is attacking
    expect(testAttacker!.action).toBe('hunt');

    // run ticks
    testAttacker?.tick(500);
    testEnemy?.tick(500);

    // get attacker's new slowEnemy count from DB
    const slowEnemyWornOff = DB.prepare(
      `
            SELECT slowEnemy FROM mobs WHERE id = :id
        `
    ).get({ id: testAttacker!.id }) as { slowEnemy: number };

    // check attributes on attacker (should be 0)
    expect(slowEnemyWornOff.slowEnemy).toBe(startSlowEnemy);
    // check enemy speed (should be slowed)
    expect(testEnemy!._speed).toBe(startEnemySpeed * 0.5);
  });
});

// PURPLE POTION TESTS

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
    expect(testMob!._defense).toBe(startDefense + (startDefense * 0.5));
    
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

    testAttacker?.tick(500);
    testEnemy?.tick(500);

    expect(testAttacker!.action).toBe('hunt');

    testAttacker?.tick(500);
    testEnemy?.tick(500);

    // grab health of enemy, make sure it has changed
    const healthWithBaseDefense = testEnemy!.health;
    expect(healthWithBaseDefense).toBeLessThan(testEnemy!._maxHealth);

    // heal enemy so we can register another tick of damage
    testEnemy?.changeHealth(testEnemy!._maxHealth - testEnemy!.health)

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

afterAll(() => {
  DB.close();
});
