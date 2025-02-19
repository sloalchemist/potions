import { commonSetup, world, itemGenerator } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { DB } from '../../src/services/database';
import { Coord } from '@rt-potion/common';
import { Favorability } from '../../src/favorability/favorability';
import { Mob } from '../../src/mobs/mob';
import { ItemGenerator } from '../../src/items/itemGenerator';

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
    const position: Coord = { x: 0, y: 0 };
    mobFactory.makeMob('villager', position, 'testBlob', 'blobtest');
    var testMob = Mob.getMob('testBlob');
    expect(testMob).not.toBeUndefined();

    // test the initial score is correct
    const score = Favorability.getMoodIndex(testMob!);
    expect(score).toBeCloseTo(1);

    // test the aggregation score is correct (assume LLM gave score of 2.5)
    const score2 = Favorability.aggConversationScore(testMob!, 2.5);
    expect(score2).toBeCloseTo(3.5);
  });

  test('Player stat change', () => {
    // initialize player
    const position: Coord = { x: 0, y: 0 };
    mobFactory.makeMob('player', position, 'testPlayer', 'playertest');
    var testMob = Mob.getMob('testPlayer');
    expect(testMob).not.toBeUndefined();

    // test the initial score is correct
    Community.makeFavor('alchemists', 'blobs', 100);
    Community.makeFavor('alchemists', 'silverclaw', 100);
    Community.makeFavor('alchemists', 'fighters', 100);

    // test whether the stat change is correct if favorability = 100
    Favorability.updatePlayerStat(testMob!);
    expect(testMob?._speed).toBeCloseTo(3.5);
    expect(testMob?._maxHealth).toBeCloseTo(176);
    expect(testMob?._attack).toBeCloseTo(6.9);

    // should revert back to normal if favorability back to 0
    Community.adjustFavor('alchemists', 'blobs', -100);
    expect(Community.getFavor('alchemists', 'blobs')).toBeCloseTo(0);
    Community.adjustFavor('alchemists', 'silverclaw', -100);
    Community.adjustFavor('alchemists', 'fighters', -100);

    Favorability.updatePlayerStat(testMob!);
    expect(testMob?._speed).toBeCloseTo(2.5);
    expect(testMob?._maxHealth).toBeCloseTo(100);
    expect(testMob?._attack).toBeCloseTo(5);
  });

  test('Favorability should decrease upon hitting mob', () => {
    // initialize villager / player
    const position: Coord = { x: 0, y: 0 };
    const position2: Coord = { x: 1, y: 1 };
    mobFactory.makeMob('player', position, 'testPlayer', 'playertest');
    mobFactory.makeMob('villager', position2, 'testVillager', 'villagertest');
    var testplayer = Mob.getMob('testPlayer');
    var testvillager = Mob.getMob('testVillager');

    Community.makeFavor('alchemists', 'silverclaw', 100);
    Community.makeFavor('alchemists', 'blobs', 100);
    Community.makeFavor('alchemists', 'fighters', 100);

    expect(testplayer).toBeDefined();

    Favorability.updatePlayerStat(testplayer!);
    expect(testplayer?._maxHealth).toBeCloseTo(176);

    // player attacks villager once
    expect(testplayer?.fightRequest(testvillager!)).toBeDefined();
    expect(Community.getFavor('alchemists', 'silverclaw')).toBe(80);

    // player attacks villager five times
    expect(testplayer?.fightRequest(testvillager!)).toBeDefined();
    expect(testplayer?.fightRequest(testvillager!)).toBeDefined();
    expect(testplayer?.fightRequest(testvillager!)).toBeDefined();
    expect(testplayer?.fightRequest(testvillager!)).toBeDefined();
    expect(testplayer?.fightRequest(testvillager!)).toBeDefined();
    expect(Community.getFavor('alchemists', 'silverclaw')).toBe(-20);
    expect(testplayer?._maxHealth).toBeCloseTo(100);
  });
  test('Mob should have a favorite item', () => {
    // initialize player
    const position: Coord = { x: 0, y: 0 };
    const possible_items = Object.keys(itemGenerator._itemTypes);

    mobFactory.makeMob('player', position, 'testPlayer', 'playertest');
    var testplayer = Mob.getMob('testPlayer');
    var testplayer_item = testplayer!._favorite_item!;

    expect(testplayer).toBeDefined();
    expect(testplayer_item).toBeDefined();
    expect(testplayer_item).not.toBeNull();

    // testing whether the item actually a possible item type that could be generated
    expect(possible_items.includes(testplayer_item)).toBe(true);
  });
  test('Mobs favorite item should be carryable', () => {
    // initialize player
    const position: Coord = { x: 0, y: 0 };

    mobFactory.makeMob('player', position, 'testPlayer', 'playertest');
    var testplayer = Mob.getMob('testPlayer');
    var testplayer_item = testplayer!._favorite_item!;

    expect(testplayer).toBeDefined();
    expect(testplayer_item).toBeDefined();
    expect(testplayer_item).not.toBeNull();

    // testing whether the item actually a possible item type that could be generated
    expect(itemGenerator._itemTypes[testplayer_item].carryable).toBe(true);
  });
});

afterEach(() => {
  DB.close();
});
