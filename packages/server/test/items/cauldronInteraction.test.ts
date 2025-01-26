import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddIngredient } from '../../src/items/uses/cauldron/addIngredient';
import { Mob } from '../../src/mobs/mob';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Try to add various ingredients to the cauldron', () => {
  test('Try to add 4 ingredients to the cauldron: Should ONLY the first 3', () => {
    //set up the world
    const cauldronPosition: Coord = { x: 0, y: 1 };
    const position: Coord = { x: 0, y: 0 };

    //create a cauldron
    itemGenerator.createItem({
      type: 'cauldron',
      position: cauldronPosition,
      attributes: {
        ingredients: 0,
        potion_subtype: ''
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

    // ensure the player is carrying the ingredient
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('heart-beet');

    // add the ingredient to the Cauldron
    const testAddFirstIngredient = new AddIngredient();
    const testFirst = testAddFirstIngredient.interact(testMob!, testCauldron!);
    expect(testFirst).toBe(true);

    // check that the ingredient was added
    const standAfter = Item.getItem(cauldronID!);
    expect(standAfter).not.toBeNull();
    expect(standAfter!.getAttribute('ingredients')).toBe(1);

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      carriedBy: testMob
    });

    // ensure the player is carrying the ingredient
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('blueberry');

    // add the ingredient to the Cauldron
    const testAddSecondIngredient = new AddIngredient();
    const testSecond = testAddSecondIngredient.interact(
      testMob!,
      testCauldron!
    );

    expect(testSecond).toBe(true);

    // check that the ingredient was added
    const standAfterSecond = Item.getItem(cauldronID!);
    expect(standAfterSecond).not.toBeNull();
    expect(standAfterSecond!.getAttribute('ingredients')).toBe(2);

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      carriedBy: testMob
    });

    // ensure the player is carrying the ingredient
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('blueberry');

    // add the ingredient to the Cauldron
    const testAddThirdIngredient = new AddIngredient();
    const testThird = testAddThirdIngredient.interact(testMob!, testCauldron!);

    expect(testThird).toBe(true);

    // check that the ingredient was added
    const standAfterThird = Item.getItem(cauldronID!);
    expect(standAfterThird).not.toBeNull();
    expect(standAfterThird!.getAttribute('ingredients')).toBe(3);

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      carriedBy: testMob
    });

    // ensure the player is carrying the ingredient
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('blueberry');

    // add the ingredient to the Cauldron
    const testAddFourthIngredient = new AddIngredient();
    const testFourth = testAddFourthIngredient.interact(
      testMob!,
      testCauldron!
    );

    expect(testFourth).toBe(false);

    // check that the ingredient was NOT added
    const standAfterFourth = Item.getItem(cauldronID!);
    expect(standAfterFourth).not.toBeNull();
    expect(standAfterFourth!.getAttribute('ingredients')).toBe(3);
  });
});

afterEach(() => {
  DB.close();
});
