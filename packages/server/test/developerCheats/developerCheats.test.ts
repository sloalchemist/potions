import { commonSetup, world } from '../testSetup';
import { DB } from '../../src/services/database';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { applyCheat } from '../../src/services/developerCheats';
import { Coord } from '@rt-potion/common';

// Mock supabase setup - This shadows the supabase import throughout the code, as it
// typically requires .env vars that the CI/CD does not have / does not need
jest.mock('../../src/services/setup', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: null, error: null }),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: null, error: null }),
        download: jest.fn().mockResolvedValue({ data: new Blob(), error: null })
      }))
    }
  }
}));

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
    jest.spyOn(testMob, 'changeEffect').mockImplementation(() => {});
    jest.spyOn(testMob, 'changeHealth').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
    DB.close();
  });

  test('Call speed up character', () => {
    applyCheat(testMob, 'speed');
    expect(testMob.changeEffect).toHaveBeenCalled();
  });

  test('Call change health', () => {
    applyCheat(testMob, 'health');
    expect(testMob.changeHealth).toHaveBeenCalled();
  });
});
