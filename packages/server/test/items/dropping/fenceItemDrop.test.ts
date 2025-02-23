import { commonSetup, world, itemGenerator } from '../../testSetup'; //  Always need to call to init everything
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Mob } from '../../../src/mobs/mob';
import { Community } from '../../../src/community/community';
import { Item } from '../../../src/items/item';
import { Smashable } from '../../../src/items/smashable';
import { DB } from '../../../src/services/database';

//  does our initialize setup
beforeAll(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Fence Drop Item', () => {
  test('case: drop log when fence is destroyed', () => {
    //  create items at desired location
    const mobPosition = { x: 1, y: 1 };
    const partialWallPosition = { x: 0, y: 1 };
    const fencePosition = { x: 1, y: 0 };
    const wallPosition = { x: 0, y: 0 };

    // Create player mob
    mobFactory.makeMob('player', mobPosition, '1', 'testPlayer');
    const testMob = Mob.getMob('1');

    //  Verify mob spawned
    expect(testMob).toBeInstanceOf(Mob);
    expect(testMob).not.toBeNull();

    //  create partial-wall
    itemGenerator.createItem({
      type: 'partial-wall',
      position: partialWallPosition
    });

    // testing to see it partialWallId and partialWall were spawned
    const partialWallId = Item.getItemIDAt(partialWallPosition);
    expect(partialWallId).not.toBeNull();
    const partialWall = Item.getItem(partialWallId!);
    expect(partialWall).toBeDefined();

    //  creating a smashable partialWall
    const smashablePWall = Smashable.fromItem(partialWall!);
    expect(smashablePWall).not.toBeNull();
    smashablePWall?.smashItem(testMob!);

    const logPosition = Item.getItemIDAt(partialWallPosition);
    expect(logPosition).not.toBeNull();
    const log = Item.getItem(logPosition!);
    expect(log).toBeDefined();
    expect(log?.type).toBe('log');

    //  create fence
    itemGenerator.createItem({
      type: 'fence',
      position: fencePosition,
      attributes: {
        health: 0
      }
    });

    //  testing to see if fence spawned
    const fenceId = Item.getItemIDAt(fencePosition);
    expect(fenceId).not.toBeNull();
    const fence = Item.getItem(fenceId!);
    expect(fence).toBeDefined();

    //  creating a smashable fence
    const smashableFence = Smashable.fromItem(fence!);
    expect(smashableFence).not.toBeNull();
    smashableFence?.smashItem(testMob!);

    const logPosition2 = Item.getItemIDAt(fencePosition);
    expect(logPosition2).not.toBeNull();
    const log2 = Item.getItem(logPosition2!);
    expect(log2).toBeDefined();
    expect(log2?.type).toBe('log');

    // testing wall
    itemGenerator.createItem({
      type: 'wall',
      position: wallPosition,
      attributes: {
        health: 0
      }
    });

    //  testing to see if wall spawned
    const wallId = Item.getItemIDAt(wallPosition);
    expect(wallId).not.toBeNull();
    const wall = Item.getItem(wallId!);
    expect(wall).toBeDefined();

    //  creating a smashable wall
    const smashableWall = Smashable.fromItem(wall!);
    expect(smashableWall).not.toBeNull();
    smashableWall?.smashItem(testMob!);

    const logPosition3 = Item.getItemIDAt(wallPosition);
    expect(logPosition3).not.toBeNull();
    const log3 = Item.getItem(logPosition3!);
    expect(log3).toBeDefined();
    expect(log3?.type).toBe('log');
  });
});

afterAll(() => {
  DB.close();
});
