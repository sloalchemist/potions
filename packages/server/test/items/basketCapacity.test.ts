import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Item } from '../../src/items/item';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Mob } from '../../src/mobs/mob';
import { Community } from '../../src/community/community';

/* 
    Tests if player is able to add more than 10 logs to basket.
    Need: Player, Basket, Log
*/

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
});

const worldDescription = {
  tiles: [
    [-1, -1],
    [-1, -1]
  ],
  terrain_types: [],
  item_types: [
    {
      name: 'Basket',
      description: 'test',
      type: 'basket',
      carryable: true,
      smashable: true,
      walkable: true,
      interactions: [],
      attributes: [],
      on_tick: []
    },
    {
      name: 'Log',
      description: 'test',
      type: 'log',
      carryable: true,
      smashable: true,
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
  ],
  "containers": [
    { "type": "basket", "coord": { "x": 14, "y": 38 }, "community": "alchemists", "itemType": "log", "count": 0, "capacity": 10 }
  ],
};

describe('Try to add logs to basket until max capacity is reached', () => {
    // world setup
    const basketPosition = { x: 1, y: 1 };
    const playerPosition = { x: 0, y: 1};
    mobFactory.loadTemplates(worldDescription.mob_types);

    // create basket
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    itemGenerator.createItem({
      type: 'basket',
      position: basketPosition
    });
    const basketID = Item.getItemIDAt(basketPosition);
    expect(basketID).not.toBeNull();

});