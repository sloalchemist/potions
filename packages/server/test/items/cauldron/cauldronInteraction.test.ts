import { commonSetup, world, itemGenerator } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Community } from '../../../src/community/community';
import { Item } from '../../../src/items/item';
import { AddIngredient } from '../../../src/items/uses/cauldron/addIngredient';
import { DumpCauldron } from '../../../src/items/uses/cauldron/dumpCauldron';
import { BottlePotion } from '../../../src/items/uses/cauldron/bottlePotion';
import { Mob } from '../../../src/mobs/mob';
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

describe('Removing unwanted potions from the cauldron', () => {
  test('Dump cauldron with 1 item', () => {
    //set up the world
    const cauldronPosition: Coord = { x: 0, y: 1 };
    const position: Coord = { x: 0, y: 0 };

    //create a cauldron
    itemGenerator.createItem({
      type: 'cauldron',
      position: cauldronPosition,
      attributes: {
        ingredients: 1,
        potion_subtype: '#0000ff'
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

    //dump item
    const testDumpCauldron = new DumpCauldron();
    testDumpCauldron.interact(testMob!, testCauldron!);

    //ensure cauldron is empty
    const cauldronAfter = Item.getItem(cauldronID!);
    expect(cauldronAfter).not.toBeNull();
    expect(cauldronAfter!.getAttribute('ingredients')).toBe(0);
    expect(cauldronAfter!.getAttribute('potion_subtype')).toBe(0);
  });
});

describe('Brewing potions in the cauldron', () => {
  test('Brew a blue potion', () => {
    //set up the world
    const cauldronPosition: Coord = { x: 0, y: 1 };
    const position: Coord = { x: 0, y: 0 };

    //create a cauldron
    itemGenerator.createItem({
      type: 'cauldron',
      position: cauldronPosition,
      attributes: {
        ingredients: 1,
        potion_subtype: 255
      }
    });
    const cauldronID = Item.getItemIDAt(cauldronPosition);
    expect(cauldronID).not.toBeNull();
    const testCauldron = Item.getItem(cauldronID!);
    expect(testCauldron).not.toBeNull();

    //create a player
    mobFactory.makeMob('player', position, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();

    //bottle potion
    const testBottlePotion = new BottlePotion();
    testBottlePotion.interact(testMob!, testCauldron!);

    //ensure cauldron is empty
    expect(testCauldron).not.toBeNull();
    expect(testCauldron!.getAttribute('ingredients')).toBe(0);
    expect(testCauldron!.getAttribute('potion_subtype')).toBe(0);

    //ensure mob is carrying the correct potion
    expect(testMob).not.toBeNull();
    const testPotion = testMob!.carrying;
    expect(testPotion).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testPotion!.subtype).toBe('255');
  });

  test('Brew a red potion', () => {
    //set up the world
    const cauldronPosition: Coord = { x: 0, y: 1 };
    const position: Coord = { x: 0, y: 0 };

    //create a cauldron
    itemGenerator.createItem({
      type: 'cauldron',
      position: cauldronPosition,
      attributes: {
        ingredients: 1,
        potion_subtype: 16711680
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

    //bottle potion
    const testBottlePotion = new BottlePotion();
    testBottlePotion.interact(testMob!, testCauldron!);

    //ensure cauldron is empty
    expect(testCauldron).not.toBeNull();
    expect(testCauldron!.getAttribute('ingredients')).toBe(0);
    expect(testCauldron!.getAttribute('potion_subtype')).toBe(0);

    //ensure mob is carrying the correct potion
    expect(testMob).not.toBeNull();
    const testPotion = testMob!.carrying;
    expect(testPotion).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testPotion!.subtype).toBe('16711680');
  });
});

describe('Brew and bottle potions', () => {
  test('Add a heartbeet to cauldron to brew a red potion and bottle it', () => {
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

    //bottle potion
    const testBottlePotion = new BottlePotion();
    testBottlePotion.interact(testMob!, testCauldron!);

    //ensure cauldron is empty
    expect(testCauldron).not.toBeNull();
    expect(testCauldron!.getAttribute('ingredients')).toBe(0);
    expect(testCauldron!.getAttribute('potion_subtype')).toBe(0);

    //ensure mob is carrying the correct potion
    expect(testMob).not.toBeNull();
    const testPotion = testMob!.carrying;
    expect(testPotion).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testPotion!.subtype).toBe('16711680');
  });

  test('Add a red potion to cauldron to brew a red potion and bottle it', () => {
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
      type: 'potion',
      carriedBy: testMob,
      subtype: '16711680'
    });

    // ensure the player is carrying the ingredient
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');

    // add the ingredient to the Cauldron
    const testAddFirstIngredient = new AddIngredient();
    const testFirst = testAddFirstIngredient.interact(testMob!, testCauldron!);
    expect(testFirst).toBe(true);

    // check that the ingredient was added
    const standAfter = Item.getItem(cauldronID!);
    expect(standAfter).not.toBeNull();
    expect(standAfter!.getAttribute('ingredients')).toBe(1);

    //bottle potion
    const testBottlePotion = new BottlePotion();
    testBottlePotion.interact(testMob!, testCauldron!);

    //ensure cauldron is empty
    expect(testCauldron).not.toBeNull();
    expect(testCauldron!.getAttribute('ingredients')).toBe(0);
    expect(testCauldron!.getAttribute('potion_subtype')).toBe(0);

    //ensure mob is carrying the correct potion
    expect(testMob).not.toBeNull();
    const testPotion = testMob!.carrying;
    expect(testPotion).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
    expect(testPotion!.subtype).toBe('16711680');
  });
});

afterEach(() => {
  DB.close();
});
