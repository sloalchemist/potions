import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddIngredient } from '../../src/items/uses/cauldron/addIngredient';
import { Mob } from '../../src/mobs/mob';
import { Coord } from '@rt-potion/common';

import { Cauldron } from '../../src/items/cauldron';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Try to add various ingredients to the cauldron', () => {
  test('Add a blue potion: Should add the potion', () => {
    //set up the world
    const cauldronPosition: Coord = { x: 0, y: 1 };
    const position: Coord = { x: 0, y: 0 };

    //create a cauldron
    itemGenerator.createItem({
      type: 'cauldron',
      position: cauldronPosition,
      attributes: {
        ingredients: 0,
        potion_subtype: ""
      }
    });
    const cauldronID = Item.getItemIDAt(cauldronPosition);
    expect(cauldronID).not.toBeNull();
    const testCauldron = Item.getItem(cauldronID!);
    expect(testCauldron).not.toBeNull();

    // create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    // create a heartbeat
    itemGenerator.createItem({
      type: 'heart-beet',
      carriedBy: testMob
    });

    // ensure the player is carrying the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('heart-beet');

    // add the ingredient to the Cauldron
    const testAddIngredient = new AddIngredient();
    const test = testAddIngredient.interact(testMob!, testCauldron!);
    expect(test).toBe(true);

    // check that the ingredient was added
    const standAfter = Item.getItem(cauldronID!);
    expect(standAfter).not.toBeNull();
    expect(standAfter!.getAttribute('ingredients')).toBe(1);
  });

});

afterEach(() => {
  DB.close();
});
