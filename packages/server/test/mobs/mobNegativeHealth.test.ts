import { commonSetup } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';

beforeAll(() => {
  commonSetup();
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
      item_types: [],
      mob_types: [
        {
            "name": "Player",
            "description": "The player",
            "name_style": "norse-english",
            "type": "player",
            "health": 100,
            "speed": 2.5,
            "attack": 5,
            "gold": 0,
            "community": "alchemists",
            "stubbornness": 20,
            "bravery": 5,
            "aggression": 5,
            "industriousness": 40,
            "adventurousness": 10,
            "gluttony": 50,
            "sleepy": 80,
            "extroversion": 50,
            "speaker": true
          }
      ]
    };
    const position = { x: 0, y: 0 };

    // create mobFactory's mobTemplates
    mobFactory.mobTemplates['player'] = worldDescription.mob_types[0];
    // create player mob
    mobFactory.makeMob(
        "player",
        position,
        "1"
    );
    // query mob from world
    const testMob = Mob.getMob("1");
    // check mob's initial health
    expect(testMob?.health).toBe(100);
    // change health of mob
    testMob?.changeHealth(-110);
    // check mob's new health
    expect(testMob?.health).toBe(0);
  });
});

afterAll(() => {
  DB.close();
});