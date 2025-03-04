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

describe('Try to consume grey potion in various cases', () => {
    test('Test grey potion consumption back to back', () => {
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
  
afterAll(() => {
  DB.close();
});
