import { mobFactory } from '../../src/mobs/mobFactory';
import { Smashable } from '../../src/items/smashable';
import { Community } from '../../src/community/community';
import { commonSetup, itemGenerator, world } from '../testSetup';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';

describe('Smashing An Item Always Does Damage', () => {
  beforeAll(() => {
    commonSetup();
  });

  test('Smash does 1 damge for zero in rng or product of non-zero for rng and mob attack', () => {
    const positionMob = { x: 0, y: 0 };
    const positionItem = { x: 1, y: 1 };
    itemGenerator.createItem({
      type: 'fence',
      position: positionItem
    });

    const fenceID = Item.getItemIDAt(positionItem);
    if (!fenceID) {
      throw new Error(`No item found at ${JSON.stringify(positionItem)}`);
    }
    const fence = Item.getItem(fenceID);
    if (!fence) {
      throw new Error(`No item found with id ${JSON.stringify(fenceID)}`);
    }
    const smashableFence = Smashable.fromItem(fence);
    if (!smashableFence) {
      throw new Error(
        `No smashable item created from ${JSON.stringify(smashableFence)}`
      );
    }

    mobFactory.loadTemplates(world.mobTypes);
    Community.makeVillage('alchemists', 'Alchemists guild');
    const mobId = 'testmob';

    mobFactory.makeMob('player', positionMob, mobId, 'testPlayers');
    const playerMob = Mob.getMob(mobId);
    if (!playerMob) {
      throw new Error(`No mob found with id ${JSON.stringify(mobId)}`);
    }

    smashableFence.smashItem(playerMob, () => 0);
    expect(fence.getAttribute('health')).toBe(99);
    smashableFence.smashItem(playerMob, () => 0.5);
    expect(fence.getAttribute('health')).toBe(97);
    smashableFence.smashItem(playerMob, () => 1);
    expect(fence.getAttribute('health')).toBe(92);
  });

  afterAll(() => {
    DB.close();
  });
});
