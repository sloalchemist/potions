import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Retrieve } from '../../src/items/uses/stand/retrieve';
import { Mob } from '../../src/mobs/mob';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  mobFactory.loadTemplates(world.mobTypes);
  Community.makeVillage('alchemists', 'Alchemists guild');
});

describe('Potion Stand Retrieval Tests', () => {
  describe('Retrieve Potion from Stand', () => {
    test('Should allow a player to retrieve a potion from the stand', () => {
      const standPosition : Coord = { x: 0, y: 1 };
      const playerPosition : Coord = { x: 0, y: 0 };
      const potionLocation: Coord = { x: 1, y: 0 }

      // Create a potion stand
      itemGenerator.createItem({
        type: 'potion-stand',
        subtype: '255',
        position: standPosition,
        attributes: {
          templateType: 'potion',
        },
      });
      const standID = Item.getItemIDAt(standPosition);
      expect(standID).not.toBeNull();

      const potionStand = Item.getItem(standID!);
      expect(potionStand).toBeDefined();

      // Create a player
      mobFactory.makeMob('player', playerPosition, 'TestID', 'TestPlayer');
      const player = Mob.getMob('TestID');
      expect(player).toBeDefined();
      expect(player!.carrying).toBeUndefined();

      // Create a potion and give it to the player
      itemGenerator.createItem({
        type: 'potion',
        subtype: '255',
        position: potionLocation,
        carriedBy: player,
      });

      // Place potion on the stand
      const addPotion = new AddItem();
      addPotion.interact(player!, potionStand!);

      // Verify the potion is on the stand
      expect(potionStand!.getAttribute('items')).toBe(1);

      // Verify the player is not carrying anything
      expect(player!.carrying).toBeUndefined();

      // Player retrieves the potion from the stand
      const retrievePotion = new Retrieve();
      const result = retrievePotion.interact(player!, potionStand!);
      expect(result).toBe(true);

      // Verify the stand is empty
      expect(potionStand!.getAttribute('items')).toBe(0);

      // Verify the player has the potion
      expect(player!.carrying).not.toBeNull();
      expect(player!.carrying!.type).toBe('potion');
    });
  });
});

afterEach(() => {
  DB.close();
});
