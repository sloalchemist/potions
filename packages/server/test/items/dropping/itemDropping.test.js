import { commonSetup } from '../../testSetup';
import { ItemGenerator } from '../../../src/items/itemGenerator';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Mob } from '../../../src/mobs/mob';
import { DB } from '../../../src/services/database';
import { Community } from '../../../src/community/community';
import { Carryable } from '../../../src/items/carryable';
import { Item } from '../../../src/items/item';

beforeAll(() => {
  commonSetup();
});

describe('Create a player, pick up an item, and drop the item.', () => {
  test(
    'should (1) create 1 player mob-type, (2) have player grab item, ' +
      '(3) drop item (4) item should not belong to player (5) item should be on the ground',
    () => {
      const worldDescription = {
        tiles: [
          [-1, -1],
          [-1, -1]
        ],
        terrain_types: [],
        item_types: [
          {
            name: 'Heart Beet',
            description: 'A heart-shaped beet',
            type: 'heart-beet',
            carryable: true,
            walkable: true,
            interactions: [],
            attributes: [],
            on_tick: []
          }
        ],
        mob_types: [
          {
            name: 'Player',
            description: 'The player',
            name_style: 'norse-english',
            type: 'player',
            health: 100,
            speed: 2.5,
            attack: 5,
            gold: 0,
            community: 'alchemists',
            stubbornness: 20,
            bravery: 5,
            aggression: 5,
            industriousness: 40,
            adventurousness: 10,
            gluttony: 50,
            sleepy: 80,
            extroversion: 50,
            speaker: true
          }
        ],
        communities: [],
        regions: []
      };

      const player_position = { x: 0, y: 0 };

      // Create mobFactory's mobTemplates
      mobFactory.loadTemplates(worldDescription.mob_types);

      // Create community
      Community.makeVillage('alchemists', 'Alchemists guild');

      // Create player mob
      mobFactory.makeMob('player', player_position, '1', 'testPlayer');

      const playerMob = Mob.getMob('1');
      if (!playerMob) {
        throw new Error(`No mob found with ID ${1}`);
      }

      // Create beet
      const itemGenerator = new ItemGenerator(worldDescription.item_types);
      const beet_position = { x: 2, y: 2 };

      itemGenerator.createItem({
        type: 'heart-beet',
        position: beet_position
      });

      const beetID = Item.getItemIDAt(beet_position);

      if (!beetID) {
        throw new Error(
          `No item found at position ${JSON.stringify(beet_position)}`
        );
      }

      const heartbeet = Item.getItem(beetID);

      if (!heartbeet) {
        throw new Error(`No item found with ID ${beetID}`);
      }

      const carryableBeet = Carryable.fromItem(heartbeet);

      if (!carryableBeet) {
        throw new Error('Potion is not carryable!');
      }

      // Have Player Pick Up Item
      expect(playerMob.carrying).toBeUndefined();
      carryableBeet.pickup(playerMob);
      expect(playerMob.carrying).toBeDefined(); // Assert that playerMob is not carrying anything once dropped

      // Attempt to Drop Item
      const carriedID = Item.getItemIDAt(beet_position); // item carried by player so ID wont exist
      carryableBeet.dropAtFeet(playerMob);
      const droppedID = Item.getItemIDAt(playerMob.position); // item dropped at player's feet
      console.log('droppedID', droppedID);
      console.log('carriedID', carriedID);

      // Assertions
      expect(carriedID).toBeUndefined(); // Assert that the beet is being carried by the player
      expect(droppedID).toBe(beetID); // Assert that the beet has been dropped at the player's feet
      expect(playerMob.carrying).toBeUndefined(); // Assert that playerMob is not carrying anything once dropped
    }
  );
});

afterAll(() => {
  DB.close();
});
