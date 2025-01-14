import { commonSetup, world } from '../testSetup';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { Carryable } from '../../src/items/carryable';
import { Item } from '../../src/items/item';
import { drinkPotion } from '../../src/items/potionEffects';
import { DB } from '../../src/services/database';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Coord } from "@rt-potion/common";

console.log('STARITNG TESTTTTTTT')

beforeAll(() => {
    commonSetup();
    Community.makeVillage('alchemists', 'Alchemists guild');
  });

console.log('ABOUT TO MAKE WORLD')

describe('Try to add various color potions to a blue potion-stand', () => {
    test('Add a blue potion: Should add the potion', () => {
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

      console.log('Created the world')

      //set up the world
      const standPosition = { x: 0, y: 1 };
      const position = { x: 0, y: 0 };
      mobFactory.loadTemplates(worldDescription.mob_types);

      console.log('SET UP THE WORLD')

      // create a player
      mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
      console.log('LEFT MOB FACTORY')
      const testMob = Mob.getMob('TestID');

      console.log('DONE CREATING PLAYER')

      // create a potion
      const itemGenerator = new ItemGenerator(worldDescription.item_types);
      itemGenerator.createItem({
        type: 'potion',
        subtype: '255',
        position: { x: 1, y: 0 },
        carriedBy: testMob
      });
      const potion = Item.getItemIDAt({ x: 1, y: 0 });
      const potionItem = Item.getItem(potion!);

      console.log('CREATED POTION')

      // Store initial speed
      const initialSpeed = testMob!.speed;

      // Drink the potion and check the effect
      const potionType = '255';  // Assuming this corresponds to the potion you've created
      const potionEffectApplied = drinkPotion(testMob!, potionType);

      // Verify the potion effect
      expect(potionEffectApplied).toBeFalsy(); // Ensure the function didn't return true (which is used for health effects)
      expect(testMob!.speed).toBe(initialSpeed + 2);

    });
});

afterEach(() => {
    DB.close();
  });

      