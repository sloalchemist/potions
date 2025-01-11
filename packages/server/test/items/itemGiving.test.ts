import { commonSetup, graph } from '../testSetup';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Community } from '../../src/community/community';
import { buildAndSaveGraph, constructGraph, initialize } from '@rt-potion/converse';
import { Carryable } from '../../src/items/carryable';
import { Item } from '../../src/items/item';

beforeAll(() => {
  commonSetup("../server/data/itemGivingtest.db");
  buildAndSaveGraph('../converse/data/test.db', constructGraph(graph));
  initialize('../converse/data/test.db');
});

describe('Create 2 unallied mobs and try to give item from one to another', () => {
  test(
    'should (1) create 2 unallied mobs, (2) have one mob grab item, ' +
      '(3) attempt to pass item between mobs (4) item should not be passed',
    () => {
      const worldDescription = {
        tiles: [
          [-1, -1],
          [-1, -1],
        ],
        terrain_types: [],
        item_types: [
          {
            name: 'Potion',
            description: 'A magical concoction',
            type: 'potion',
            subtype: '255',
            carryable: true,
            walkable: true,
            interactions: [],
            attributes: [],
            on_tick: [],
          },
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
            speaker: true,
          },
          {
            name: 'Blob',
            description: 'A Mob',
            name_style: 'norse-english',
            type: 'blob',
            health: 100,
            speed: 2.5,
            attack: 5,
            gold: 0,
            community: 'blobs',
            stubbornness: 20,
            bravery: 5,
            aggression: 5,
            industriousness: 40,
            adventurousness: 10,
            gluttony: 50,
            sleepy: 80,
            extroversion: 50,
            speaker: true,
          },
        ],
        communities: [],
        regions: [],
      };

      const position = { x: 0, y: 0 };
      const position2 = { x: 1, y: 1 };

      // Create mobFactory's mobTemplates
      mobFactory.loadTemplates(worldDescription.mob_types);

      // Create communities (not allied)
      Community.makeVillage('alchemists', 'Alchemists guild');
      Community.makeVillage('blobs', 'Blobs');

      // Create player mob
      mobFactory.makeMob('player', position, '1', 'testPlayer');

      const playerMob = Mob.getMob('1');
      if (!playerMob) {
        throw new Error(`No mob found with ID ${1}`);
      }

      // Create blob mob
      mobFactory.makeMob('blob', position2, '2', 'testBlob');

      const blobMob = Mob.getMob('2');
      if (!blobMob) {
        throw new Error(`No mob found with ID ${2}`);
      }

      // Create Potion
      const itemGenerator = new ItemGenerator(worldDescription.item_types);
      const position3 = { x: 2, y: 2 };

      itemGenerator.createItem({
        type: 'potion',
        position: position3,
      });

      const potionID = Item.getItemIDAt(position3);

      if (!potionID) {
        throw new Error(`No item found at position ${JSON.stringify(position3)}`);
      }

      const potion = Item.getItem(potionID);

      if (!potion) {
        throw new Error(`No item found with ID ${potionID}`);
      }

      const carryablePotion = Carryable.fromItem(potion);

      if (!carryablePotion) {
        throw new Error('Potion is not carryable!');
      }

      // Have Player Pick Up Item
      carryablePotion.pickup(playerMob);

      // Attempt to give item between non allied mobs
      const result = carryablePotion.giveItem(playerMob, blobMob);

      // Assertions
      expect(result).toBe(false); // Assert that the item cannot be given
      expect(playerMob.carrying).toBeDefined(); // Assert that playerMob is still carrying something
      expect(blobMob.carrying).toBeUndefined(); // Assert that blobMob is not carrying anything
    }
  );
});

afterAll(() => {
  DB.close();
});
