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

describe('Player picks up a second item while already carrying one', () => {
  test('should drop the first item and carry the second', () => {
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

    // Set up mob templates and community.
    mobFactory.loadTemplates(worldDescription.mob_types);
    Community.makeVillage('alchemists', 'Alchemists guild');

    // Create player mob.
    mobFactory.makeMob('player', player_position, '1', 'testPlayer');
    const playerMob = Mob.getMob('1');
    if (!playerMob) {
      throw new Error(`No mob found with ID 1`);
    }

    // Create first "heart-beet" item at position { x: 2, y: 2 }.
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    const firstItemPosition = { x: 2, y: 2 };
    itemGenerator.createItem({
      type: 'heart-beet',
      position: firstItemPosition
    });
    const firstBeetID = Item.getItemIDAt(firstItemPosition);
    if (!firstBeetID) {
      throw new Error(
        `No item found at position ${JSON.stringify(firstItemPosition)}`
      );
    }
    const firstBeet = Item.getItem(firstBeetID);
    if (!firstBeet) {
      throw new Error(`No item found with ID ${firstBeetID}`);
    }
    const carryableFirstBeet = Carryable.fromItem(firstBeet);
    if (!carryableFirstBeet) {
      throw new Error('First heart-beet is not carryable!');
    }

    // Create second "heart-beet" item at a different position { x: 3, y: 3 }.
    const secondItemPosition = { x: 3, y: 3 };
    itemGenerator.createItem({
      type: 'heart-beet',
      position: secondItemPosition
    });
    const secondBeetID = Item.getItemIDAt(secondItemPosition);
    if (!secondBeetID) {
      throw new Error(
        `No item found at position ${JSON.stringify(secondItemPosition)}`
      );
    }
    const secondBeet = Item.getItem(secondBeetID);
    if (!secondBeet) {
      throw new Error(`No item found with ID ${secondBeetID}`);
    }
    const carryableSecondBeet = Carryable.fromItem(secondBeet);
    if (!carryableSecondBeet) {
      throw new Error('Second heart-beet is not carryable!');
    }

    // --- Begin Test Flow ---

    // Initially, player should not be carrying anything.
    expect(playerMob.carrying).toBeUndefined();

    // Have the player pick up the first item.
    carryableFirstBeet.pickup(playerMob);
    expect(playerMob.carrying).toBeDefined();
    expect(playerMob.carrying?.id).toEqual(firstBeet.id);

    // Have the player pick up the second item.
    carryableSecondBeet.pickup(playerMob);

    // Assert that the player is now carrying the second item.
    expect(playerMob.carrying).toBeDefined();
    expect(playerMob.carrying?.id).toEqual(secondBeet.id);

    // Assert that the first item was dropped at the player's position.
    const droppedFirstBeetID = Item.getItemIDAt(playerMob.position);
    expect(droppedFirstBeetID).toEqual(firstBeet.id);

    // And confirm that the player is no longer carrying the first item.
    expect(playerMob.carrying?.id).not.toEqual(firstBeet.id);
  });
});

afterAll(() => {
  DB.close();
});
