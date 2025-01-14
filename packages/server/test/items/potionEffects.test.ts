import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Mob } from '../../src/mobs/mob';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { Drink } from '../../src/items/uses/drink';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
});

describe('Try to add various color potions to a blue potion-stand', () => {
  test('Create player, consumer blue potions, check increased speed.', () => {
    const worldDescription = {
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [],
      item_types: [
        {
          name: 'Potion',
          description: 'A magical concoction',
          type: 'potion',
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
      communities: [
        {
          id: 'alchemists',
          name: 'Alchemists guild',
          description:
            "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."
        }
      ]
    };

    //set up the world
    const standPosition = { x: 0, y: 1 };
    const position = { x: 0, y: 0 };
    mobFactory.loadTemplates(worldDescription.mob_types);

    const itemGenerator = new ItemGenerator(worldDescription.item_types);

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
        type: 'potion',
        subtype: '255',
        position: { x: 1, y: 0 },
        carriedBy: testMob
      });
      const potion = Item.getItemIDAt({ x: 1, y: 0 });
      expect(potion).not.toBeNull();
      const potionItem = Item.getItem(potion!);
      expect(potionItem).not.toBeNull();
  
      // ensure the player is carrying the potion
      expect(testMob!.carrying).not.toBeNull();
      expect(testMob!.carrying!.type).toBe('potion');
      expect(testMob!.carrying!.subtype).toBe('255');

      // have the player drink the potion
      const testDrink = new Drink();
      const test = testDrink.interact(testMob!, potionItem!);
      expect(test).toBe(true);

      // check new speed on player
      

  });
});

afterEach(() => {
  DB.close();
});
