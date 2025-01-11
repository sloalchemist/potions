import { commonSetup, graph } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Community } from '../../src/community/community';
import { buildAndSaveGraph, constructGraph, initialize } from '@rt-potion/converse';

beforeAll(() => {
  commonSetup("data/mobNegativeHealth.test.db");
  buildAndSaveGraph('../converse/data/test.db', constructGraph(graph));
  initialize('../converse/data/test.db');
});

describe('Create mob and remove more health than it has', () => {
  test('should (1) create player mob, (2) remove all health, ' +
    '(3) health should be zero, not negative', () => {
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
            subtype: '255',
            carryable: true,
            walkable: true,
            interactions: [],
            attributes: [],
            on_tick: []
          },
  
          {
            name: 'Potion stand',
            description: 'A stand that sells health potions.',
            type: 'potion-stand',
            carryable: false,
            smashable: true,
            walkable: true,
            show_price_at: {
              x: 7,
              y: -10
            },
  
            subtype: '255',
            interactions: [
              {
                description: 'Add $item_name',
                action: 'add_item',
                while_carried: false
              }
            ],
            attributes: [
              {
                name: 'items',
                value: 0
              },
              {
                name: 'price',
                value: 10
              },
              {
                name: 'gold',
                value: 0
              },
              {
                name: 'health',
                value: 1
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
        communities: [
          { 
            id: 'alchemists', 
            name: 'Alchemists guild', 
            description: "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."  
          }
        ],
        regions: [
          {
            id: "elyndra",
            name: "elyndra",
            description: "the overall world in which everything exists.",
            parent: null,
            concepts: ["concept_elyndra", "concept_elyndra_as_battleground"]
          },
          {
            id: "claw_island",
            name: "Claw Island",
            description: "a relatively peaceful island in the Shattered Expanse full of blueberries and heartbeets.",
            parent: "shattered_expanse",
            concepts: []
          }
        ]
      };
    const position = { x: 0, y: 0 };

    // create mobFactory's mobTemplates
    mobFactory.loadTemplates(worldDescription.mob_types);
    // create community
    Community.makeVillage("alchemists", "Alchemists guild");

    // create player mob
    mobFactory.makeMob(
        "player",
        position,
        "1",
        "testPlayer"
    );

    // query mob from world
    const testMob = Mob.getMob("1");
    // check mob's initial health
    expect(testMob?.health).toBe(100);
    // change health of mob to deplete more than total health of mob
    testMob?.changeHealth(-110);
    // check mob's new health is zero, not less than zero
    expect(testMob?.health).toBe(0);
  });
});

afterAll(() => {
  DB.close();
});