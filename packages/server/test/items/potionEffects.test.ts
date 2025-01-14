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

describe('Try to consume blue potion in various cases', () => {
  test('Create player, consume blue potion, then check attributes', () => {
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

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player
    expect(testMob!._speed).toBe(4.5);
    expect(testMob!.health).toBe(100);
    expect(testMob!.gold).toBe(0);
  });

  test('Create player with near max speed, consume blue potion, then check attributes', () => {
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
          speed: 9,
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

    // check to make sure potion is not being carried
    expect(testMob!.carrying).toBeUndefined();

    // check attributes on player, make sure 10 is cap for speed
    expect(testMob!._speed).toBe(10);
    expect(testMob!.health).toBe(100);
    expect(testMob!.gold).toBe(0);
  });
});

afterEach(() => {
  DB.close();
});
