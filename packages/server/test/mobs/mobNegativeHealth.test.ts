import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';

beforeAll(() => {
  commonSetup();
});

describe('Create mob and remove more health than it has', () => {
  test('should (1) create player mob, (2) remove all health, ' +
    '(3) health should be zero, not negative', () => {
    // const worldDescription = {
    //   tiles: [
    //     [-1, -1],
    //     [-1, -1]
    //   ],
    //   terrain_types: [],
    //   item_types: [
    //     {
    //       name: 'Heart Beet',
    //       description: 'A heart-shaped beet',
    //       type: 'heart-beet',
    //       carryable: true,
    //       walkable: true,
    //       interactions: [],
    //       attributes: [],
    //       on_tick: []
    //     }
    //   ],
    //   mob_types: []
    // };
    const position = { x: 0, y: 0 };
    // create player mob
    mobFactory.makeMob(
        "player",
        position,
        "test ID"
    );

    // query mob from world
    const testMob = Mob.getMob("test ID");
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