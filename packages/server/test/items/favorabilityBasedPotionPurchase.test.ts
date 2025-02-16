import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { GetItem } from '../../src/items/uses/container/getItem';
import { Mob } from '../../src/mobs/mob';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  const alchemistVil = Community.makeVillage('alchemists', 'Alchemists guild');
  const fightersVil = Community.makeVillage('fighters', 'Fighters guild');
  Community.makeAlliance(alchemistVil, fightersVil);
  Community.makeFavor('alchemists', 'fighters', 60); // Set favorability
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Favorability-Based Purchase Tests', () => {
  test('Should allow an allied fighter mob to purchase a potion from the stand based on favorability', () => {
    const standPosition: Coord = { x: 0, y: 1 };
    const playerPosition: Coord = { x: 0, y: 0 };
    const potionLocation: Coord = { x: 1, y: 0 };

    // Create a potion stand
    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: '255',
      position: standPosition,
      attributes: {
        templateType: 'potion',
        price: 15, // Set a reasonable price
        items: 1
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();

    const potionStand = Item.getItem(standID!);
    expect(potionStand).toBeDefined();

    // Create a player
    mobFactory.makeMob('player', playerPosition, 'TestID', 'TestPlayer');
    const player = Mob.getMob('TestID');
    expect(player).toBeDefined();
    expect(player!.carrying).toBeUndefined();

    // Create a fighter
    mobFactory.makeMob('fighter', playerPosition, 'TestID2', 'TestFighter');
    const fighter = Mob.getMob('TestID2');
    expect(fighter).toBeDefined();
    expect(fighter!.carrying).toBeUndefined();

    // Fighter purchases the potion from the stand
    const purchasePotion = new GetItem();
    const result = purchasePotion.interact(fighter!, potionStand!);
    expect(result).toBe(true); // Should be true based on favorability
    expect(fighter!.carrying).toBeDefined(); // Fighter should have the potion
  });
});

afterEach(() => {
  DB.close();
});
