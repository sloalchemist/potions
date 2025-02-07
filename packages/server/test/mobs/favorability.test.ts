import { commonSetup, world } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { DB } from '../../src/services/database';
import { Coord } from '@rt-potion/common';
import { Favorability } from '../../src/favorability/favorability';
import { Mob } from '../../src/mobs/mob';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blobs');
  Community.makeVillage('silverclaw', 'Village of Silverclaw');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Favorability Tests', () => {
  test('Make favorability between two communities', () => {
    // initialize favor between alchemists and blobs to be 369
    Community.makeFavor('alchemists', 'blobs', 369);

    // Test favorability getFavor is accurate
    const favorTest1 = Community.getFavor('alchemists', 'blobs');
    const favorTest2 = Community.getFavor('blobs', 'alchemists');
    expect(favorTest1).toBe(369);
    expect(favorTest2).toBe(369);
  });

  test('Test whether mood index calculation works', () => {
    // initialize mob
    const position: Coord = { x: 0, y: 0}
    mobFactory.makeMob('villager', position, "testBlob", "blobtest")
    var testMob = Mob.getMob('testBlob')
    expect(testMob).not.toBeUndefined()

    const score = Favorability.getMoodIndex(testMob!)
    expect(score).toBeCloseTo(1)
  })
});

afterEach(() => {
  DB.close();
});
