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
import { MarketStand } from '../../../src/items/marketStand';

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

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // get new slowEnemy from DB
    const slowEnemy_stacked = DB.prepare(
      `
            SELECT slowEnemy FROM mobs WHERE id = :id
        `
    ).get({ id: testMob!.id }) as { slowEnemy: number };

    // check attributes on player (should be same as before)
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

    testAttacker?.tick(500);
    testEnemy?.tick(500);

    // check to make sure potion is not being carried
    expect(testAttacker!.carrying).toBeUndefined();

    // make sure the fight initiator is attacking
    expect(testAttacker!.action).toBe('hunt');

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

    // attack a few times
    testAttacker?.tick(500);
    testEnemy?.tick(500);
    // breaks?

    // grab health of enemy after defense pot and damage taken
    const healthWithMoreDefense = testEnemy!.health;
    expect(healthWithMoreDefense).not.toBe(testEnemy!._maxHealth);

    // check attributes on enemy
    expect(healthWithBaseDefense).toBeLessThan(healthWithMoreDefense);
  });
});

// TOXIC POTION TEST

describe('Test consumption of toxic potions', () => {
  test('Test Drinking Tar', () => {
    const position: Coord = { x: 0, y: 0 };
    const potionLocation: Coord = { x: 1, y: 0 };

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a tar potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#1B1212')),
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
      String(hexStringToNumber('#1B1212'))
    );

    // have the player drink the tar
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // Player should be dead
    expect(testMob!.health).toBe(0);
  });
});

// GREEN POTION TESTS

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

// POTION TEST

describe('Try to consume potion in various cases', () => {
  test('Test potion with mobs and items (basket) in a 3 pixel radius', () => {
    FantasyDate.initialDate();
    const positionPlayer1: Coord = { x: 1, y: 0 };
    const positionPlayer2: Coord = { x: 1, y: 1 };
    const potionLocation: Coord = { x: 0, y: 0 };
    const mobPosition: Coord = { x: 0, y: 1 };
    const blueberryPosition: Coord = { x: 1, y: 2 };
    const basketPosition: Coord = { x: 0, y: 2 };

    // create a player
    mobFactory.makeMob('player', positionPlayer1, 'TestID', 'TestPlayer');
    const testPlayer = Mob.getMob('TestID');
    expect(testPlayer).not.toBeNull();

    // create a mob
    mobFactory.makeMob('blob', mobPosition, 'TestingID', 'TestAttacker');
    const testMob = Mob.getMob('TestingID');
    expect(testMob).not.toBeNull();

    // create a second player
    mobFactory.makeMob(
      'player',
      positionPlayer2,
      'Player2TestID',
      'TestPlayer2'
    );
    const testPlayer2 = Mob.getMob('Player2TestID');
    expect(testPlayer2).not.toBeNull();

    // create a basket
    itemGenerator.createItem({
      type: 'basket',
      position: basketPosition
    });
    const testBasket = Item.getItemIDAt(basketPosition);
    expect(testBasket).not.toBe(undefined);
    expect(testBasket).not.toBeNull();

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      position: blueberryPosition
    });
    const testBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(testBlueberry).not.toBe(undefined);
    expect(testBlueberry).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#614f79')),
      position: potionLocation,
      carriedBy: testPlayer
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testPlayer!.carrying).not.toBeNull();
    expect(testPlayer!.carrying!.type).toBe('potion');
    expect(testPlayer!.carrying!.subtype).toBe(
      String(hexStringToNumber('#614f79'))
    );

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testPlayer!, potionItem!);
    expect(test).toBe(true);

    // check that the mob disappeared
    const disappearedMob = Mob.getMob('TestingID');
    expect(disappearedMob?.action).toBe('destroyed');

    // check that the second player disappeared
    const disappearedPlayer = Mob.getMob('Player2TestID');
    expect(disappearedPlayer?.action).toBe('destroyed');

    // check that the blueberry disappeared
    const disappearedBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(disappearedBlueberry).toBe(undefined);

    // check that the basket disappeared
    const disappearedBasket = Item.getItemIDAt(basketPosition);
    expect(disappearedBasket).toBe(undefined);
  });

  test('Test potion with mobs and items (empty stand) in a 3 pixel radius', () => {
    FantasyDate.initialDate();
    const positionPlayer1: Coord = { x: 1, y: 0 };
    const potionLocation: Coord = { x: 0, y: 0 };
    const mobPosition: Coord = { x: 0, y: 1 };
    const blueberryPosition: Coord = { x: 1, y: 2 };
    const standPosition: Coord = { x: 0, y: 2 };
    // const standItemPosition: Coord = { x: 1, y: 1 };

    // create a player
    mobFactory.makeMob('player', positionPlayer1, 'TestID', 'TestPlayer');
    const testPlayer = Mob.getMob('TestID');
    expect(testPlayer).not.toBeNull();

    // create a mob
    mobFactory.makeMob('blob', mobPosition, 'TestingID', 'TestAttacker');
    const testMob = Mob.getMob('TestingID');
    expect(testMob).not.toBeNull();

    // create a stand
    itemGenerator.createItem({
      type: 'potion-stand',
      position: standPosition
    });
    const testStand = Item.getItemIDAt(standPosition);
    expect(testStand).not.toBe(undefined);
    expect(testStand).not.toBeNull();

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      position: blueberryPosition
    });
    const testBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(testBlueberry).not.toBe(undefined);
    expect(testBlueberry).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#614f79')),
      position: potionLocation,
      carriedBy: testPlayer
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testPlayer!.carrying).not.toBeNull();
    expect(testPlayer!.carrying!.type).toBe('potion');
    expect(testPlayer!.carrying!.subtype).toBe(
      String(hexStringToNumber('#614f79'))
    );

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testPlayer!, potionItem!);
    expect(test).toBe(true);

    // check that the mob disappeared
    const disappearedMob = Mob.getMob('TestingID');
    expect(disappearedMob?.action).toBe('destroyed');

    // check that the blueberry disappeared
    const disappearedBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(disappearedBlueberry).toBe(undefined);

    // check that the basket disappeared
    const disappearedStand = Item.getItemIDAt(standPosition);
    expect(disappearedStand).toBe(undefined);
  });

  test('Test potion with mobs and items (stand with items) in a 3 pixel radius', () => {
    FantasyDate.initialDate();
    const positionPlayer1: Coord = { x: 1, y: 0 };
    const potionLocation: Coord = { x: 0, y: 0 };
    const mobPosition: Coord = { x: 0, y: 1 };
    const blueberryPosition: Coord = { x: 1, y: 2 };
    const standPosition: Coord = { x: 0, y: 2 };
    // const standItemPosition: Coord = { x: 1, y: 1 };

    // create a player
    mobFactory.makeMob('player', positionPlayer1, 'TestID', 'TestPlayer');
    const testPlayer = Mob.getMob('TestID');
    expect(testPlayer).not.toBeNull();

    // create a mob
    mobFactory.makeMob('blob', mobPosition, 'TestingID', 'TestAttacker');
    const testMob = Mob.getMob('TestingID');
    expect(testMob).not.toBeNull();

    // create a potion to be put into the stand
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#614f79')),
      position: potionLocation,
      carriedBy: testPlayer
    });
    const standPotion = Item.getItemIDAt(potionLocation);
    expect(standPotion).not.toBeNull();
    const standPotionItem = Item.getItem(standPotion!);
    expect(standPotionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testPlayer!.carrying).not.toBeNull();
    expect(testPlayer!.carrying!.type).toBe('potion');
    expect(testPlayer!.carrying!.subtype).toBe(
      String(hexStringToNumber('#614f79'))
    );

    // create a market stand with an item added to it
    itemGenerator.createItem({
      type: 'potion-stand',
      position: standPosition,
      attributes: {
        inventory: JSON.stringify({}),
        prices: JSON.stringify({})
      }
    });
    const testStand = Item.getItemIDAt(standPosition);
    expect(testStand).not.toBe(undefined);
    const testStandItem = Item.getItem(testStand!);
    expect(testStandItem).not.toBeNull();

    const marketStand = MarketStand.fromItem(testStandItem!);
    expect(marketStand).not.toBe(undefined);
    if (marketStand) {
      // add the potion the player is carrying to the stand
      const added = marketStand.addItem(testPlayer!);
      expect(added).toBe(true);
    }

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      position: blueberryPosition
    });
    const testBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(testBlueberry).not.toBe(undefined);
    expect(testBlueberry).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#614f79')),
      position: potionLocation,
      carriedBy: testPlayer
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testPlayer!.carrying).not.toBeNull();
    expect(testPlayer!.carrying!.type).toBe('potion');
    expect(testPlayer!.carrying!.subtype).toBe(
      String(hexStringToNumber('#614f79'))
    );

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testPlayer!, potionItem!);
    expect(test).toBe(true);

    // check that the mob disappeared
    const disappearedMob = Mob.getMob('TestingID');
    expect(disappearedMob?.action).toBe('destroyed');

    // check that the blueberry disappeared
    const disappearedBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(disappearedBlueberry).toBe(undefined);

    // check that the stand disappeared, along with the item in it
    const disappearedStand = Item.getItemIDAt(standPosition);
    expect(disappearedStand).toBe(undefined);
  });
});

afterAll(() => {
  DB.close();
});

afterAll(() => {
  DB.close();
});
