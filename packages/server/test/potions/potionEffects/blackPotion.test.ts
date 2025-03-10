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

    // get monster name
    const unique_monster = DB.prepare(
      `
              SELECT id, name FROM mobs WHERE name LIKE 'Monster %'
          `
    ).get() as { id: string; name: string };

    // check that monster exists
    const monster = Mob.getMob(unique_monster.id);
    expect(monster).not.toBeNull();

    //wait to make the monster time out
    // run ticks
    for (let i = 0; i < 120; i++) {
      FantasyDate.runTick();
    }
    monster?.tick(500);

    // check to make sure monster is dead
    const deadMonster = Mob.getMob(unique_monster.id);
    expect(deadMonster?.action).toBe('destroyed');
  });
});

describe('Try to consume an unknown potion that is similar to black potion in various cases', () => {
  test('test weak black potion effect', () => {
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
      subtype: String(hexStringToNumber('#166082')),
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
      String(hexStringToNumber('#166082'))
    );

    // have the attacker drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testMob!, potionItem!);
    expect(test).toBe(true);

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // get monster name
    const unique_monster = DB.prepare(
      `
              SELECT id, name FROM mobs WHERE name LIKE 'Monster %'
          `
    ).get() as { id: string; name: string };

    // check that monster exists
    const monster = Mob.getMob(unique_monster.id);
    expect(monster).not.toBeNull();

    // wait to make the monster time out
    // run ticks
    for (let i = 0; i < 120 * 0.5; i++) {
      FantasyDate.runTick();
    }
    monster?.tick(500);

    // check to make sure monster is dead
    const deadMonster = Mob.getMob(unique_monster.id);
    expect(deadMonster?.action).toBe('destroyed');
  });
});

afterAll(() => {
  DB.close();
});
