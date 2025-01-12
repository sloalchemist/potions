import { ItemGenerator } from '../../../src/items/itemGenerator';
import { commonSetup } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { Item } from '../../../src/items/item';
import { BuildWall } from '../../../src/items/uses/building/buildWall';
import { Mob } from '../../../src/mobs/mob';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Pickup } from '../../../src/items/uses/pickup';
import { Community } from '../../../src/community/community';
import {buildAndSaveGraph, constructGraph } from '@rt-potion/converse';
import { buildGraphFromWorld } from '../../../src/generate/socialWorld'

beforeAll(() => {
  commonSetup('data/building.test.db');
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
              description: 'Build wall',
              action: 'build_wall',
              while_carried: true,
              requires_item: 'partial-wall'
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
              name: 'complete',
              value: 3
            }
          ]
        },
        {
          name: 'Wall',
          description:
            'A sturdy structure that blocks movement and provides protection.',
          type: 'wall',
          carryable: false,
          walkable: false,
          interactions: [],
          attributes: [
            {
              name: 'health',
              value: 100
            }
          ],
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
      regions: [
        {
          id: "claw_island",
          name: "claw_island",
          description: "This is claw island",
          parent: null,
          concepts: []
        }
      ],
      communities: [
        { "id": "alchemists", "name": "Alchemists guild", "description": "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."  }
      ],
      alliances: [],
      houses: [],
      items: [],
      containers: []
    };

    const socialWorld = buildGraphFromWorld(worldDescription);
    const graph = constructGraph(socialWorld);
    buildAndSaveGraph('data/knowledge-graph-build-test.db', graph)

    //generate world
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    const logPos = { x: 0, y: 0 };
    itemGenerator.createItem({
      type: 'log',
      position: logPos
    });

    const wallPos = { x: 0, y: 1 };
    itemGenerator.createItem({
      type: 'partial-wall',
      position: wallPos
    });

    const logId = Item.getItemIDAt(logPos);
    expect(logId).not.toBeNull();
    const log = Item.getItem(logId!);

    Community.makeVillage("alchemists", "Alchemists guild");
    // const community = Community.getVillage("village1");
    // console.log("community: ", community);

    mobFactory.loadTemplates(worldDescription.mob_types);
    // mobFactory.makeMob('villager', { x: 1, y: 0 }, 'test-villager', 'bob');
    mobFactory.makeMob('player', { x: 1, y: 0 }, '79e0aef2', 'TestPlayer');

    const mob = Mob.getMob('test-villager');
    expect(mob).toBeInstanceOf(Mob);

    expect(mob).toBeDefined();
    expect(log).toBeDefined();

    if (mob && log) {
      const pickup = new Pickup();

      //does the pickup still happen if it is in an expect statement?
      expect(pickup.interact(mob, log)).toBeTruthy();
      //check that the mob is carrying something
      expect(mob.carrying).toBeDefined();
      
      const buildWall = new BuildWall();
      const wallInteract = buildWall.interact(mob, log);
      expect(wallInteract).toBeTruthy();

      //make sure something is at the partial wall location
      const oldPartialWallID = Item.getItemIDAt(wallPos);
      expect(oldPartialWallID).not.toBeNull();
      const itemAtWallPos = Item.getItem(oldPartialWallID!);
      expect(itemAtWallPos).not.toBeNull();

      //make sure item is a wall and not partial wall
      expect(itemAtWallPos!.type).toBe('wall');
    }
  });
});

afterAll(() => {
  DB.close();
});
