import { ItemGenerator } from '../../../src/items/itemGenerator';
import { commonSetup } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { Item } from '../../../src/items/item';
import { BuildWall } from '../../../src/items/uses/building/buildWall';
import { MobI } from '@rt-potion/common';
import { Mob } from '../../../src/mobs/mob';

beforeAll(() => {
  commonSetup();
});

describe('Build wall from partial wall', () => {
  test('should build wall from partial wall', () => {
    const worldDescription = {
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [],
      item_types: [
        {
          name: 'Log',
          description: 'A piece of wood',
          type: 'log',
          carryable: true,
          smashable: true,
          walkable: true,
          interactions: [
            {
              "description": "Build wall",
              "action": "build_wall",
              "while_carried": true,
              "requires_item": "partial-wall"
          }
          ],
          attributes: [],
          on_tick: []
        },
        {
          name: 'Partial Wall',
          description: 'A partially formed wall',
          type: 'partial-wall',
          carryable: false,
          walkable: false,
          interactions: [],
          attributes: [
            {
              "name": "complete",
              "value": 3
            }
          ]
        }
      ],
      mob_types: [
        {
          name: 'Villager',
          type: 'villager',
          speaker: true
        }
      ]
    };

    //generate world
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    const logPos = { x: 0, y: 0};
    itemGenerator.createItem({
      type: 'log',
      position: logPos
    });

    const wallPos = { x: 3, y: 3};
    itemGenerator.createItem({
      type: 'partial-wall',
      position: wallPos
    });
    const logId = Item.getItemIDAt(logPos);
    expect(logId).not.toBeNull();
    const log = Item.getItem(logId!);

    let villager: MobI;
    villager = {
      id: 'villager',
      position: { x: 5, y: 5 },
      type: 'villager',
      subtype: '',
      path: [],
      speed: 1,
      name: 'TestVillager',
      maxHealth: 10,
      carrying: undefined, 
      attributes: {},
      unlocks: [],
      doing: ''
    };
    villager.carrying = logId;
    const buildWall = new BuildWall();
    const wallInteract = buildWall.interact(villager, log);
    //need to trigger "interact" in buildWall.ts
    //mob.carrying = log?
    //expect there to be a wall at our coords

    //without bug fix there is a partial wall so test fails
    //expect to be wall instead of partial wall 
    
  });
});

afterAll(() => {
  DB.close();
});