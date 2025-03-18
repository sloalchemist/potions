import { commonSetup, world, itemGenerator } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Community } from '../../../src/community/community';
import { Item } from '../../../src/items/item';
import { CollectGold } from '../../../src/items/uses/marketstand/collectGold';
import { DestroyMarketStand } from '../../../src/items/uses/marketstand/destroyMarketStand';
import { Mob } from '../../../src/mobs/mob';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Market Stand Character Ownership Tests', () => {
  test('Owner can collect gold, non-owner cannot', () => {
    const ownerID: string = 'ownerID';
    const standPosition: Coord = { x: 0, y: 1 };
    const playerPosition: Coord = { x: 0, y: 0 };

    // Create owner
    mobFactory.makeMob('player', playerPosition, ownerID, 'owner');
    const owner = Mob.getMob(ownerID);
    expect(owner).toBeDefined();
    expect(owner!.gold).toBe(0);

    // Create non-owner
    mobFactory.makeMob('player', playerPosition, 'notOwnerID', 'nonOwner');
    const nonOwner = Mob.getMob('notOwnerID');
    expect(nonOwner).toBeDefined();
    expect(nonOwner!.gold).toBe(0);

    // Create market stand owned by owner
    itemGenerator.createItem({
      type: 'market-stand',
      subtype: '255',
      position: standPosition,
      ownedByCharacter: ownerID,
      attributes: {
        templateType: 'log',
        items: 0,
        gold: 50,
        price: 10,
        health: 1
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();
    const marketStand = Item.getItem(standID!);
    expect(marketStand).toBeDefined();

    // Attempt gold collection by non-owner
    const collectGold = new CollectGold();
    const nonOwnerResult = collectGold.interact(nonOwner!, marketStand!);
    expect(nonOwnerResult).toBe(false);
    expect(nonOwner!.gold).toBe(0);

    // Attempt gold collection by owner
    const ownerResult = collectGold.interact(owner!, marketStand!);
    expect(ownerResult).toBe(true);
    expect(owner!.gold).toBe(50);

    // Attempt destroy stand by non-owner
    const destroyStand = new DestroyMarketStand();
    const nonOwnerDestroy = destroyStand.interact(nonOwner!, marketStand!);
    expect(nonOwnerDestroy).toBe(false);

    // Attempt destroy stand by owner
    const ownerDestroy = destroyStand.interact(owner!, marketStand!);
    expect(ownerDestroy).toBe(true);
  });
});

afterEach(() => {
  DB.close();
});
