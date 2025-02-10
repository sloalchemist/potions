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
  Community.makeVillage('fighters', 'Village of Silverclaw');
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

    // test the initial score is correct
    const score = Favorability.getMoodIndex(testMob!)
    expect(score).toBeCloseTo(1)

    // test the aggregation score is correct (assume LLM gave score of 2.5)
    const score2 = Favorability.aggConversationScore(testMob!, 2.5)
    expect(score2).toBeCloseTo(3.5)
    
  })

  test('Player stat change', () => {
    // initialize player
    const position: Coord = { x: 0, y: 0}
    mobFactory.makeMob('player', position, "testPlayer", "playertest")
    var testMob = Mob.getMob('testPlayer')
    expect(testMob).not.toBeUndefined()

    // test the initial score is correct
    // console.log(testMob?._speed)
    // console.log(testMob?._maxHealth)
    console.log(testMob?._attack)

    Community.makeFavor('alchemists', 'blobs', 100);
    Community.makeFavor('alchemists', 'silverclaw', 100);
    Community.makeFavor('alchemists', 'fighters', 100);

    // console.log(Favorability.modifiedLogistic(1))

    Favorability.updatePlayerStat(testMob!)
    expect(testMob?._speed).toBeCloseTo(3.6)
    expect(testMob?._maxHealth).toBeCloseTo(185)
    expect(testMob?._attack).toBeCloseTo(7.1)
  })
});

afterEach(() => {
  DB.close();
});
