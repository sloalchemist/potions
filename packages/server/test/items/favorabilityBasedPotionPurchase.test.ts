import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { Purchase } from '../../src/items/uses/stand/purchase';
import { Mob } from '../../src/mobs/mob';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  const alchemistVil = Community.makeVillage('alchemists', 'Alchemists guild');
  const fightersVil = Community.makeVillage('fighters', 'Fighters guild');
  Community.makeAlliance(alchemistVil, fightersVil);
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Favorability-Based Purchase Tests', () => {
  test('Should not allow fighter to purchase a potion from player if favorability is too low', () => {
    // Set low favorability
    Community.makeFavor('alchemists', 'fighters', 0);
    expect(Community.getFavor('alchemists', 'fighters')).toBe(0);

    const standPosition: Coord = { x: 0, y: 1 };
    const playerPosition: Coord = { x: 0, y: 0 };

    // Create a potion stand
    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: '255',
      position: standPosition,
      ownedBy: Community.getVillage('alchemists'),
      attributes: {
        templateType: 'potion',
        subtype: '255',
        price: 15,
        items: 1
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();

    const potionStand = Item.getItem(standID!);
    expect(potionStand).toBeDefined();

    // Create a fighter with gold
    mobFactory.makeMob('fighter', playerPosition, 'TestID', 'TestFighter', undefined, undefined, 100);
    const fighter = Mob.getMob('TestID');
    expect(fighter).toBeDefined();
    expect(fighter!.carrying).toBeUndefined();
    expect(fighter!.gold).toBe(100);

    // Verify the potion is on the stand
    expect(potionStand!.getAttribute('items')).toBe(1);

    // Fighter purchases the potion from the stand
    const purchasePotion = new Purchase();
    const result = purchasePotion.interact(fighter!, potionStand!);
    expect(result).toBe(false); // Should be false based on favorability
    expect(fighter!.carrying).toBeUndefined(); // Fighter should not have the potion
  });

  test('Should allow fighter to purchase a potion from player if favorability is high enough', () => {
    // Set neutral favorability
    Community.makeFavor('alchemists', 'fighters', 50);
    expect(Community.getFavor('alchemists', 'fighters')).toBe(50);

    const standPosition: Coord = { x: 0, y: 1 };
    const playerPosition: Coord = { x: 0, y: 0 };

    // Create a potion stand
    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: '255',
      position: standPosition,
      ownedBy: Community.getVillage('alchemists'),
      attributes: {
        templateType: 'potion',
        subtype: '255',
        price: 15, // Set a reasonable price
        items: 1
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();

    const potionStand = Item.getItem(standID!);
    expect(potionStand).toBeDefined();

    // Create a fighter
    mobFactory.makeMob('fighter', playerPosition, 'TestID', 'TestFighter', undefined, undefined, 100);
    const fighter = Mob.getMob('TestID');
    expect(fighter).toBeDefined();
    expect(fighter!.carrying).toBeUndefined();
    expect(fighter!.gold).toBe(100);

    // Verify the potion is on the stand
    expect(potionStand!.getAttribute('items')).toBe(1);

    // Fighter purchases the potion from the stand
    const purchasePotion = new Purchase();
    const result = purchasePotion.interact(fighter!, potionStand!);
    expect(result).toBe(true); // Should be true based on favorability
    expect(fighter!.carrying).toBeDefined(); // Fighter should have the potion
  });

  test('Should allow fighter to purchase a potion from player if price is a little higher when favorability is high', () => {
    // Set high favorability
    Community.makeFavor('alchemists', 'fighters', 100);
    expect(Community.getFavor('alchemists', 'fighters')).toBe(100);

    const standPosition: Coord = { x: 0, y: 1 };
    const playerPosition: Coord = { x: 0, y: 0 };

    // Create a potion stand
    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: '255',
      position: standPosition,
      ownedBy: Community.getVillage('alchemists'),
      attributes: {
        templateType: 'potion',
        subtype: '255',
        price: 40, // Set a higher relative price
        items: 1
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();

    const potionStand = Item.getItem(standID!);
    expect(potionStand).toBeDefined();

    // Create a fighter
    mobFactory.makeMob('fighter', playerPosition, 'TestID2', 'TestFighter', undefined, undefined, 100);
    const fighter = Mob.getMob('TestID2');
    expect(fighter).toBeDefined();
    expect(fighter!.carrying).toBeUndefined();
    expect(fighter!.gold).toBe(100);

    // Verify the potion is on the stand
    expect(potionStand!.getAttribute('items')).toBe(1);

    // Fighter purchases the potion from the stand
    const purchasePotion = new Purchase();
    const result = purchasePotion.interact(fighter!, potionStand!);
    expect(result).toBe(true); // Should be true based on high favorability
    expect(fighter!.carrying).toBeDefined(); // Fighter should have the potion
  });

  test('Should not allow fighter to purchase a potion from player if price is too high even if favorability is high', () => {
    // Set high favorability
    Community.makeFavor('alchemists', 'fighters', 100);
    expect(Community.getFavor('alchemists', 'fighters')).toBe(100);

    const standPosition: Coord = { x: 0, y: 1 };
    const playerPosition: Coord = { x: 0, y: 0 };

    // Create a potion stand
    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: '255',
      position: standPosition,
      ownedBy: Community.getVillage('alchemists'),
      attributes: {
        templateType: 'potion',
        subtype: '255',
        price: 99, // Set a high price
        items: 1
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();

    const potionStand = Item.getItem(standID!);
    expect(potionStand).toBeDefined();

    // Create a fighter
    mobFactory.makeMob('fighter', playerPosition, 'TestID2', 'TestFighter', undefined, undefined, 100);
    const fighter = Mob.getMob('TestID2');
    expect(fighter).toBeDefined();
    expect(fighter!.carrying).toBeUndefined();
    expect(fighter!.gold).toBe(100);

    // Verify the potion is on the stand
    expect(potionStand!.getAttribute('items')).toBe(1);

    // Fighter purchases the potion from the stand
    const purchasePotion = new Purchase();
    const result = purchasePotion.interact(fighter!, potionStand!);
    expect(result).toBe(false); // Should be false based on high price
    expect(fighter!.carrying).toBeUndefined(); // Fighter should not have the potion
  });
});

afterEach(() => {
  DB.close();
});
