import { commonSetup, world, itemGenerator } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Community } from '../../../src/community/community';
import { Item } from '../../../src/items/item';
import { Mob } from '../../../src/mobs/mob';
import { Drink } from '../../../src/items/uses/drink';
import { AddItem } from '../../../src/items/uses/container/addItem';
import { FantasyDate } from '../../../src/date/fantasyDate';
import { Coord } from '@rt-potion/common';
import { hexStringToNumber } from '../../../src/util/colorUtil';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blobby town');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Try to consume potion in various cases', () => {
  test('Test potion with mobs and items (basket) in a 3 pixel radius', () => {
    FantasyDate.initialDate();
    const positionPlayer1: Coord = { x: 1, y: 0 };
    const positionPlayer2: Coord = { x: 1, y: 1 };
    const potionLocation: Coord = { x: 0, y: 0 };
    const mobPosition: Coord = { x: 0, y: 1 };
    const blueberryPosition: Coord = { x: 2, y: 2 };
    const basketPosition: Coord = { x: 0, y: 2 };
    const potionStandPosition: Coord = { x: 2, y: 1 };
    const cauldronPosition: Coord = { x: 1, y: 2 };

    // create a player
    mobFactory.makeMob('player', positionPlayer1, 'TestID', 'TestPlayer');
    const testPlayer = Mob.getMob('TestID');
    expect(testPlayer).not.toBeNull();

    // create a mob
    mobFactory.makeMob('blob', mobPosition, 'TestingID', 'TestAttacker');
    const testMob = Mob.getMob('TestingID');
    expect(testMob).not.toBeNull();

    // create a second player
    mobFactory.makeMob(
      'player',
      positionPlayer2,
      'Player2TestID',
      'TestPlayer2'
    );
    const testPlayer2 = Mob.getMob('Player2TestID');
    expect(testPlayer2).not.toBeNull();

    // create a basket
    itemGenerator.createItem({
      type: 'basket',
      position: basketPosition
    });
    const testBasket = Item.getItemIDAt(basketPosition);
    expect(testBasket).not.toBe(undefined);
    expect(testBasket).not.toBeNull();

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      position: blueberryPosition
    });
    const testBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(testBlueberry).not.toBe(undefined);
    expect(testBlueberry).not.toBeNull();

    // create a potion stand
    itemGenerator.createItem({
      type: 'potion-stand',
      subtype: '255',
      position: potionStandPosition,
      attributes: {
        templateType: 'potion'
      }
    });

    const potionstandID = Item.getItemIDAt(potionStandPosition);
    expect(potionstandID).not.toBeNull();

    const potionstandItem = Item.getItem(potionstandID!);
    expect(potionstandItem).toBeDefined();

    // create a cauldron
    itemGenerator.createItem({
      type: 'cauldron',
      position: cauldronPosition
    });
    const testCauldron = Item.getItemIDAt(cauldronPosition);
    expect(testCauldron).not.toBe(undefined);
    expect(testCauldron).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#614f79')),
      position: potionLocation,
      carriedBy: testPlayer
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testPlayer!.carrying).not.toBeNull();
    expect(testPlayer!.carrying!.type).toBe('potion');
    expect(testPlayer!.carrying!.subtype).toBe(
      String(hexStringToNumber('#614f79'))
    );

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testPlayer!, potionItem!);
    expect(test).toBe(true);

    // check that the mob disappeared
    const disappearedMob = Mob.getMob('TestingID');
    expect(disappearedMob?.action).toBe('destroyed');

    // check that the second player disappeared
    const disappearedPlayer = Mob.getMob('Player2TestID');
    expect(disappearedPlayer?.action).toBe('destroyed');

    // check that the blueberry disappeared
    const disappearedBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(disappearedBlueberry).toBe(undefined);

    // check that the basket disappeared
    const disappearedBasket = Item.getItemIDAt(basketPosition);
    expect(disappearedBasket).toBe(undefined);

    // check that the potion stand disappeared
    const disappearedPotionStand = Item.getItemIDAt(potionStandPosition);
    expect(disappearedPotionStand).not.toBeDefined();

    // check that the potion stand DID NOT disappear
    const notDisappearedCauldron = Item.getItemIDAt(cauldronPosition);
    expect(notDisappearedCauldron).toBeDefined();
  });

  test(`Test potion with mobs and items (empty stand) in a 3 pixel radius 
    + effect of bomb on things outside the radius`, () => {
    FantasyDate.initialDate();
    const positionPlayer1: Coord = { x: 1, y: 0 };
    const potionLocation: Coord = { x: 0, y: 0 };
    const mobPosition: Coord = { x: 0, y: 1 };
    const blueberryPosition: Coord = { x: 1, y: 2 };
    const standPosition: Coord = { x: 0, y: 2 };
    const farBlueberryPosition: Coord = { x: 6, y: 6 };

    // create a player
    mobFactory.makeMob('player', positionPlayer1, 'TestID', 'TestPlayer');
    const testPlayer = Mob.getMob('TestID');
    expect(testPlayer).not.toBeNull();

    // create a mob
    mobFactory.makeMob('blob', mobPosition, 'TestingID', 'TestAttacker');
    const testMob = Mob.getMob('TestingID');
    expect(testMob).not.toBeNull();

    // create a stand
    itemGenerator.createItem({
      type: 'potion-stand',
      position: standPosition
    });
    const testStand = Item.getItemIDAt(standPosition);
    expect(testStand).not.toBe(undefined);
    expect(testStand).not.toBeNull();

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      position: blueberryPosition
    });
    const testBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(testBlueberry).not.toBe(undefined);
    expect(testBlueberry).not.toBeNull();

    // create a blueberry that shouldn't be blown up
    itemGenerator.createItem({
      type: 'blueberry',
      position: farBlueberryPosition
    });
    const testFarBlueberry = Item.getItemIDAt(farBlueberryPosition);
    expect(testFarBlueberry).not.toBe(undefined);
    expect(testFarBlueberry).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#614f79')),
      position: potionLocation,
      carriedBy: testPlayer
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testPlayer!.carrying).not.toBeNull();
    expect(testPlayer!.carrying!.type).toBe('potion');
    expect(testPlayer!.carrying!.subtype).toBe(
      String(hexStringToNumber('#614f79'))
    );

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testPlayer!, potionItem!);
    expect(test).toBe(true);

    // check that the mob disappeared
    const disappearedMob = Mob.getMob('TestingID');
    expect(disappearedMob?.action).toBe('destroyed');

    // check that the blueberry disappeared
    const disappearedBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(disappearedBlueberry).toBe(undefined);

    // check that the basket disappeared
    const disappearedStand = Item.getItemIDAt(standPosition);
    expect(disappearedStand).toBe(undefined);

    // check that the far away blueberry exists
    const existingBlueberry = Item.getItemIDAt(farBlueberryPosition);
    expect(existingBlueberry).not.toBe(undefined);
  });

  test('Test potion with mobs and items (basket with items) in a 3 pixel radius', () => {
    FantasyDate.initialDate();
    const positionPlayer1: Coord = { x: 1, y: 0 };
    const potionLocation: Coord = { x: 0, y: 0 };
    const potion2Location: Coord = { x: 1, y: 1 };
    const mobPosition: Coord = { x: 0, y: 1 };
    const blueberryPosition: Coord = { x: 1, y: 2 };
    const basketPosition: Coord = { x: 0, y: 2 };

    // create a player
    mobFactory.makeMob('player', positionPlayer1, 'TestID', 'TestPlayer');
    const testPlayer = Mob.getMob('TestID');
    expect(testPlayer).not.toBeNull();

    // create a mob
    mobFactory.makeMob('blob', mobPosition, 'TestingID', 'TestAttacker');
    const testMob = Mob.getMob('TestingID');
    expect(testMob).not.toBeNull();

    // create a blue potion to be put into the basket
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#0000ff')),
      position: potion2Location,
      carriedBy: testPlayer
    });
    const standPotion = Item.getItemIDAt(potion2Location);
    expect(standPotion).not.toBeNull();
    const standPotionItem = Item.getItem(standPotion!);
    expect(standPotionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testPlayer!.carrying).not.toBeNull();
    expect(testPlayer!.carrying!.type).toBe('potion');
    expect(testPlayer!.carrying!.subtype).toBe(
      String(hexStringToNumber('#0000ff'))
    );

    // create a basket
    itemGenerator.createItem({
      type: 'basket',
      position: basketPosition
    });
    const testBasket = Item.getItemIDAt(basketPosition);
    expect(testBasket).not.toBe(undefined);
    const testBasketItem = Item.getItem(testBasket!);
    expect(testBasket).not.toBeNull();

    // add the currently carried item (blue potion) to the basket
    const testAddItem = new AddItem();
    testAddItem.interact(testPlayer!, testBasketItem!);

    // create a blueberry
    itemGenerator.createItem({
      type: 'blueberry',
      position: blueberryPosition
    });
    const testBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(testBlueberry).not.toBe(undefined);
    expect(testBlueberry).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: String(hexStringToNumber('#614f79')),
      position: potionLocation,
      carriedBy: testPlayer
    });
    const potion = Item.getItemIDAt(potionLocation);
    expect(potion).not.toBeNull();
    const potionItem = Item.getItem(potion!);
    expect(potionItem).not.toBeNull();

    // ensure the player is carrying the potion
    expect(testPlayer!.carrying).not.toBeNull();
    expect(testPlayer!.carrying!.type).toBe('potion');
    expect(testPlayer!.carrying!.subtype).toBe(
      String(hexStringToNumber('#614f79'))
    );

    // have the player drink the potion
    const testDrink = new Drink();
    const test = testDrink.interact(testPlayer!, potionItem!);
    expect(test).toBe(true);

    // check that the mob disappeared
    const disappearedMob = Mob.getMob('TestingID');
    expect(disappearedMob?.action).toBe('destroyed');

    // check that the blueberry disappeared
    const disappearedBlueberry = Item.getItemIDAt(blueberryPosition);
    expect(disappearedBlueberry).toBe(undefined);

    // check that the stand disappeared, along with the item in it
    const disappearedBasket = Item.getItemIDAt(basketPosition);
    expect(disappearedBasket).toBe(undefined);
  });
});

afterAll(() => {
  DB.close();
});
