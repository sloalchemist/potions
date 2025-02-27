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
  
  
afterAll(() => {
    DB.close();
});
  
