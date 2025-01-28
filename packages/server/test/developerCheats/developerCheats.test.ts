import { commonSetup, world } from '../testSetup';
import { DB } from '../../src/services/database';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { applyCheat } from '../../src/services/developerCheats';
import { Coord } from '@rt-potion/common';

describe('testing various developerCheats', () => {
  let testMob: Mob;

  beforeEach(() => {
    commonSetup();
    Community.makeVillage('alchemists', 'Alchemists guild');
    mobFactory.loadTemplates(world.mobTypes);
    const position: Coord = { x: 0, y: 0 };
    const mobId = 'testmob';

    mobFactory.makeMob('player', position, mobId, 'testPlayer');
    testMob = Mob.getMob(mobId) as Mob;
    jest.spyOn(testMob!, 'changeSpeed').mockImplementation(() => {});
    jest.spyOn(testMob!, 'changeHealth').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('call speed up character', () => {
    applyCheat(testMob!, 'speed');
    expect(testMob!.changeSpeed).toHaveBeenCalled();
  });

  test('call change health', () => {
    applyCheat(testMob!, 'health');
    expect(testMob!.changeHealth).toHaveBeenCalled();
  });
});

afterEach(() => {
  DB.close();
});
