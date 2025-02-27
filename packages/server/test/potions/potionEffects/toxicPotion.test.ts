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
  
  afterAll(() => {
    DB.close();
  });
  
