import { commonSetup, world } from '../testSetup';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Coord } from '@rt-potion/common';
import { Community } from '../../src/community/community';
import { DB } from '../../src/services/database';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blobs');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Favorability Tests', () => {
    test('Make favorability between two communities', () => {
        // initialize favor between alchemists and blobs to be 369
        Community.makeFavor('alchemists', 'blobs', 369)

        // Test favorability getFavor is accurate
        const favorTest1 = Community.getFavor('alchemists', 'blobs')
        const favorTest2 = Community.getFavor('blobs', 'alchemists')
        expect(favorTest1).toBe(369);
        expect(favorTest2).toBe(369);
    });
});

afterEach(() => {
    DB.close();
});