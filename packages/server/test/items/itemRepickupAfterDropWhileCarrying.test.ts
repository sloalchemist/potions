import { commonSetup } from '../testSetup';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Community } from '../../src/community/community';
import { Carryable } from '../../src/items/carryable';
import { Item } from '../../src/items/item';

beforeAll(() => {
  commonSetup();
});

describe('Switching carried items', () => {
  test(
    'should drop the currently carried item when picking up a new one, and then drop that new one when re-picking up the original',
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

      const playerPosition = { x: 0, y: 0 };

      // Load mob templates and create community
      mobFactory.loadTemplates(worldDescription.mob_types);
      Community.makeVillage('alchemists', 'Alchemists guild');

      // Create player mob
      mobFactory.makeMob('player', playerPosition, '1', 'testPlayer');
      const playerMob = Mob.getMob('1');
      if (!playerMob) {
        throw new Error(`No mob found with ID 1`);
      }

      const itemGenerator = new ItemGenerator(worldDescription.item_types);

      // --- Create Item 1 ---
      const item1Position = { x: 2, y: 2 };
      itemGenerator.createItem({
        type: 'heart-beet',
        position: item1Position
      });
      const item1ID = Item.getItemIDAt(item1Position);
      if (!item1ID) {
        throw new Error(
          `No item found at position ${JSON.stringify(item1Position)}`
        );
      }
      const item1 = Item.getItem(item1ID);
      if (!item1) {
        throw new Error(`No item found with ID ${item1ID}`);
      }
      const carryableItem1 = Carryable.fromItem(item1);
      if (!carryableItem1) {
        throw new Error('Item1 is not carryable!');
      }

      // --- Create Item 2 ---
      const item2Position = { x: 3, y: 3 };
      itemGenerator.createItem({
        type: 'heart-beet',
        position: item2Position
      });
      const item2ID = Item.getItemIDAt(item2Position);
      if (!item2ID) {
        throw new Error(
          `No item found at position ${JSON.stringify(item2Position)}`
        );
      }
      const item2 = Item.getItem(item2ID);
      if (!item2) {
        throw new Error(`No item found with ID ${item2ID}`);
      }
      const carryableItem2 = Carryable.fromItem(item2);
      if (!carryableItem2) {
        throw new Error('Item2 is not carryable!');
      }

      // --- Step 1: Player picks up Item 1 ---
      expect(playerMob.carrying).toBeUndefined();
      carryableItem1.pickup(playerMob);
      // Now the player should be carrying item1, so its carried_by is set and its grid position cleared.
      expect(playerMob.carrying?.id).toBe(item1.id);
      expect(Item.getItemIDAt(item1Position)).toBeUndefined();

      // --- Step 2: Player picks up Item 2 while already carrying Item 1 ---
      carryableItem2.pickup(playerMob);
      expect(playerMob.carrying?.id).toBe(item2.id);
      // item1 should have been dropped at the player's feet.
      const droppedAfterItem2 = Item.getItemIDAt(playerMob.position);
      expect(droppedAfterItem2).toBe(item1.id);
      // And item2 (being carried) should no longer be on the grid.
      expect(Item.getItemIDAt(item2Position)).toBeUndefined();

      // --- Step 3: Player picks up Item 1 again while carrying Item 2 ---
      carryableItem1.pickup(playerMob);
      expect(playerMob.carrying?.id).toBe(item1.id);
      // item2 should be dropped at the player's feet.
      const droppedAfterItem1 = Item.getItemIDAt(playerMob.position);
      expect(droppedAfterItem1).toBe(item2.id);
      // item1 (now being carried) should not be on the grid.
      expect(Item.getItemIDAt(item1Position)).toBeUndefined();
    }
  );
});

afterAll(() => {
  DB.close();
});
