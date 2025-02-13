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
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // get new speed from DB
    const speed_blue_stacked = DB.prepare(
      `
            SELECT speed FROM mobView WHERE id = :id
        `
    ).get({ id: testMob!.id }) as { speed: number };

    // check that speed is still the same (boosted from first blue bot not stacked)
    expect(speed_blue_stacked.speed).toBe(startSpeed + startSpeed*0.5);
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
      subtype: '255',
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

    // get new speed from DB
    const speed_worn_off = DB.prepare(
      `
            SELECT speed FROM mobView WHERE id = :id
        `)
    .get({ id: testMob!.id }) as { speed: number };

    // check attributes on player (speed should be back to normal)
    expect(speed_worn_off.speed).toBe(startSpeed);

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

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // get new speed from DB
    const new_speed = DB.prepare(
      `
            SELECT speed FROM mobView WHERE id = :id
        `)
      .get({ id: testMob!.id }) as { speed: number };

    // check attributes on player (speed should be boosted again)
    expect(new_speed.speed).toBe(startSpeed + startSpeed * 0.5);
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
      subtype: '16753920',
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
    expect(testMob!.carrying!.subtype).toBe('16753920');

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

    // get new attack from DB
    const attack_boosted = DB.prepare(
      `
            SELECT attack FROM mobView WHERE id = :id
        `)
    .get({ id: testMob!.id }) as { attack: number };

    // check attributes on player (should be boosted)
    expect(attack_boosted.attack).toBe(startAttack + startAttack * 0.5);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '16753920',
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
    expect(testMob!.carrying!.subtype).toBe('16753920');

    // have the player drink the potion
    const testDrink2 = new Drink();
    const test2 = testDrink2.interact(testMob!, potionItem2!);
    expect(test2).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // get new attack from DB
    const attack_stacked = DB.prepare(
      `
            SELECT attack FROM mobView WHERE id = :id
        `)
    .get({ id: testMob!.id }) as { attack: number };

    // check attributes on player (attack should be still boosted but not stacked)
    expect(attack_stacked.attack).toBe(startAttack + startAttack * 0.5);
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
      subtype: '16753920',
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

    // get new attack from DB
    const attack_worn_off = DB.prepare(
      `
            SELECT attack FROM mobView WHERE id = :id
        `)
    .get({ id: testMob!.id }) as { attack: number };

    // check attributes on player (should be back to normal)
    expect(attack_worn_off.attack).toBe(startAttack);

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '16753920',
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

    // get new attack from DB
    const new_attack = DB.prepare(`
              SELECT attack FROM mobView WHERE id = :id
          `).get({ id: testMob!.id }) as { attack: number };

    // check attributes on player (should be boosted again)
    expect(new_attack.attack).toBe(startAttack + startAttack * 0.5);
  });
});

afterAll(() => {
  DB.close();
});
