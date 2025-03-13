import { commonSetup, world, itemGenerator } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Community } from '../../../src/community/community';
import { Item } from '../../../src/items/item';
import { CollectGold } from '../../../src/items/uses/stand/collectGold';
import { DestroyStand } from '../../../src/items/uses/stand/destroyStand';
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

    // Create potion stand owned by owner
    itemGenerator.createItem({
      type: 'market-stand',
      subtype: '255',
      position: standPosition,
      ownedByCharacter: ownerID,
      attributes: {
        templateType: 'log',
        items: 0,
        gold: 50,
        capacity: 20
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();
    const potionStand = Item.getItem(standID!);
    expect(potionStand).toBeDefined();

    // Attempt gold collection by non-owner
    const collectGold = new CollectGold();
    const nonOwnerResult = collectGold.interact(nonOwner!, potionStand!);
    expect(nonOwnerResult).toBe(false);
    expect(nonOwner!.gold).toBe(0);

    // Attempt gold collection by owner
    const ownerResult = collectGold.interact(owner!, potionStand!);
    expect(ownerResult).toBe(true);
    expect(owner!.gold).toBe(50);

    // Attempt destroy stand by non-owner
    const destroyStand = new DestroyStand();
    const nonOwnerDestroy = destroyStand.interact(nonOwner!, potionStand!);
    expect(nonOwnerDestroy).toBe(false);

    // Attempt destroy stand by owner
    const OwnerDestroy = destroyStand.interact(owner!, potionStand!);
    expect(OwnerDestroy).toBe(true);
  });
});

afterEach(() => {
  DB.close();
});
