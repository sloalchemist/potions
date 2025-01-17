import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Retrieve } from '../../src/items/uses/stand/retrieve';
import { Mob } from '../../src/mobs/mob';

beforeEach(() => {
  commonSetup();
  mobFactory.loadTemplates(world.mobTypes);
  Community.makeVillage('alchemists', 'Alchemists guild');
});

describe('Try to retrieve a potion from a potion stand', () => {
  test('Should create a potion stand with a potion and player should retrieve it', () => {
    

    // Generate world
    const standPosition = { x: 0, y: 1 };
    const playerPosition = { x: 0, y: 0 };


    // Create a potion stand

    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: '255',
      position: standPosition,
      attributes: {
        templateType: 'potion'
      }
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();
    const testStand = Item.getItem(standID!);
    expect(testStand).not.toBeNull();

    // Create player
    mobFactory.makeMob('player', playerPosition, 'TestID', 'TestPlayer');
    const testMob = Mob.getMob('TestID');
    expect(testMob).not.toBeNull();
    expect(testMob!.carrying).toBeUndefined();

    // Give potion to player
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: { x: 1, y: 0 },
      carriedBy: testMob
    });

    // Place potion on stand
    const addPotion = new AddItem();
    addPotion.interact(testMob!, testStand!);

    // Ensure potion is on stand
    expect(testStand).not.toBeNull();
    expect(testStand!.getAttribute('items')).toBe(1);

    // Check to see that player is not carrying anything before retrieval
    expect(testMob!.carrying).toBeUndefined();

    // Retrieve the potion from the stand
    const testAddItem = new Retrieve();
    const test = testAddItem.interact(testMob!, testStand!);
    expect(test).toBe(true);

    // Check that the stand is empty
    expect(testStand!.getAttribute('items')).toBe(0);

    // Check that the player has the potion
    expect(testMob!.carrying).not.toBeNull();
    expect(testMob!.carrying!.type).toBe('potion');
  });
});

afterEach(() => {
  DB.close();
});
