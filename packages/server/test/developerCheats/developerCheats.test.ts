import { commonSetup, world } from '../testSetup';
import { DB } from '../../src/services/database';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { applyCheat } from '../../src/services/developerCheats';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('testing various developerCheats', () => { 
  test('speed up character', () => {
    const position: Coord = { x: 0, y: 0 };
    const mobId = 'testmob';

    mobFactory.makeMob('player', position, mobId, 'testPlayer');
    const testMob = Mob.getMob(mobId);
    
    expect(testMob).toBeDefined();
    applyCheat(testMob!, 'speed');
    expect(testMob!.changeSpeed).toHaveBeenCalled();
  });
  });

afterEach(() => {
  DB.close();
});
