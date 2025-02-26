import { commonSetup, world, itemGenerator } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { DB } from '../../src/services/database';
import { Coord } from '@rt-potion/common';
import { Mob } from '../../src/mobs/mob';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('silverclaw', 'Village of Silverclaw');
  Community.makeVillage('fighters', 'Fighters guild');
  Community.makeVillage('blobs', 'Blobs');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Alchemist Mob Affiliation and Stats Tests', () => {
  test('Alchemist mob should have max health of 100', () => {
    // Initialize the player's position
    const playerPos: Coord = { x: 1, y: 0 };
    
    // Create a player mob using mobFactory's method (e.g., makeMob)
    mobFactory.makeMob('player', playerPos, 'testAlchemist', 'alchemisttest', 'alchemists');
    
    // Fetch the mob that was created by mobFactory
    const testMob = Mob.getMob('testAlchemist');
    
    // Ensure the mob was created correctly
    expect(testMob).not.toBeUndefined();

    // Check that the mob's community is 'alchemists'
    expect(testMob?.community_id).toBe('alchemists');
    
    // Verify that the mob's max health is set to 100
    expect(testMob?._maxHealth).toBe(100);
  });

  test('Alchemist mob should have speed of 2.5', () => {
    const playerPos: Coord = { x: 1, y: 0 };
    mobFactory.makeMob('player', playerPos, 'testAlchemist', 'alchemisttest', 'alchemists');
    const testMob = Mob.getMob('testAlchemist');
    
    expect(testMob).not.toBeUndefined();
    expect(testMob?.community_id).toBe('alchemists');
    expect(testMob?._attack).toBe(5);
  });

  test('Alchemist mob should have attack of 5', () => {
    const playerPos: Coord = { x: 1, y: 0 };
    mobFactory.makeMob('player', playerPos, 'testAlchemist', 'alchemisttest', 'alchemists');
    const testMob = Mob.getMob('testAlchemist');
    
    expect(testMob).not.toBeUndefined();
    expect(testMob?.community_id).toBe('alchemists');
    expect(testMob?._attack).toBe(5);
  });


  test('Villager affiliated mob should have max health of 200', () => {
    const mobPos: Coord = { x: 1, y: 0 };
    mobFactory.makeMob('villager', mobPos, 'testVillager', 'villagertest', 'villagers');
    const testMob = Mob.getMob('testVillager');
    
    expect(testMob).not.toBeUndefined();
    expect(testMob?.community_id).toBe('silverclaw');

    testMob?.updateStatsBasedOnAffiliation();
    
    expect(testMob?._maxHealth).toBe(200);
  });

  test('Blob affiliated mob should have attack of 7.5', () => {
    const mobPos: Coord = { x: 1, y: 0 };
    mobFactory.makeMob('blob', mobPos, 'testBlob', 'blobtest', 'blobs');
    const testMob = Mob.getMob('testBlob');
    
    expect(testMob).not.toBeUndefined();
    expect(testMob?.community_id).toBe('blobs');

    testMob?.updateStatsBasedOnAffiliation();
    
    expect(testMob?._attack).toBe(7.5);
  });

  test('Fighter affiliated mob should have speed of 3.5', () => {
    const mobPos: Coord = { x: 1, y: 0 };
    mobFactory.makeMob('fighter', mobPos, 'testFighter', 'fightertest', 'fighters');
    const testMob = Mob.getMob('testFighter');
    
    expect(testMob).not.toBeUndefined();
    expect(testMob?.community_id).toBe('fighters');

    testMob?.updateStatsBasedOnAffiliation();
    
    expect(testMob?._speed).toBe(3.75);
  });

});



afterEach(() => {
  DB.close();
});