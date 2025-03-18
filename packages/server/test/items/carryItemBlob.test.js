'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const testSetup_1 = require('../testSetup');
const mobFactory_1 = require('../../src/mobs/mobFactory');
const mob_1 = require('../../src/mobs/mob');
const database_1 = require('../../src/services/database');
const community_1 = require('../../src/community/community');
const carryable_1 = require('../../src/items/carryable');
const item_1 = require('../../src/items/item');
beforeEach(() => {
  (0, testSetup_1.commonSetup)();
  community_1.Community.makeVillage('blobs', 'Blobby town');
  mobFactory_1.mobFactory.loadTemplates(testSetup_1.world.mobTypes);
});
describe('Carrying Item Tests', () => {
  describe('Blob Can Carry Item', () => {
    test('Should allow blob to pick up and carry an item', () => {
      const position1 = { x: 0, y: 0 };
      const potionPosition = { x: 1, y: 1 };
      // Create blob mob
      mobFactory_1.mobFactory.makeMob('blob', position1, '1', 'testBlob');
      const blobMob = mob_1.Mob.getMob('1');
      expect(blobMob).toBeDefined();
      // Create potion
      testSetup_1.itemGenerator.createItem({
        type: 'potion',
        position: potionPosition
      });
      const potionID = item_1.Item.getItemIDAt(potionPosition);
      expect(potionID).not.toBeNull();
      const potion = item_1.Item.getItem(potionID);
      expect(potion).toBeDefined();
      const carryablePotion = carryable_1.Carryable.fromItem(potion);
      expect(carryablePotion).toBeDefined();
      // Player picks up the potion
      carryablePotion.pickup(blobMob);
      expect(blobMob.carrying).toBeDefined(); // Blob should have the potion
    });
    test('Should return undefined when item is not carryable', () => {
      const position1 = { x: 0, y: 0 };
      const nonCarryablePosition = { x: 2, y: 2 };
      // Create blob mob
      mobFactory_1.mobFactory.makeMob('blob', position1, '2', 'testBlob');
      const blobMob = mob_1.Mob.getMob('2');
      expect(blobMob).toBeDefined();
      // Create non-carryable item
      testSetup_1.itemGenerator.createItem({
        type: 'rock',
        position: nonCarryablePosition
      });
      const rockID = item_1.Item.getItemIDAt(nonCarryablePosition);
      expect(rockID).not.toBeNull();
      const rock = item_1.Item.getItem(rockID);
      expect(rock).toBeDefined();
      const carryableRock = carryable_1.Carryable.fromItem(rock);
      expect(carryableRock).toBeUndefined(); // Should return undefined since the rock is not carryable
    });
  });
  describe('giveItem Tests', () => {
    test('Should return false when the recipient mob is already carrying an item', () => {
      // Create 'from' mob
      const fromMob = mobFactory_1.mobFactory.makeMob(
        'blob',
        { x: 0, y: 0 },
        '1',
        'testBlob'
      );

      // Create 'to' mob, already carrying an item
      const toMob = mobFactory_1.mobFactory.makeMob(
        'blob',
        { x: 1, y: 1 },
        '2',
        'testBlob'
      );
      toMob.carrying = { itemType: 'potion' }; // Simulate that the 'to' mob is carrying an item

      // Call giveItem function
      const result = fromMob.giveItem(fromMob, toMob);

      // Expect the result to be false, since the recipient is already carrying an item
      expect(result).toBe(false);
    });
  });
  describe('dropAtFeet Tests', () => {
    test('Should throw an error when the mob has no position', () => {
      // Create a mob without position
      const mobWithoutPosition = mobFactory_1.mobFactory.makeMob(
        'blob',
        { x: 0, y: 0 },
        '1',
        'testBlob'
      );
      mobWithoutPosition.position = undefined; // Ensure no position

      // Create an item
      const item = new carryable_1.Carryable({
        id: 'item1',
        itemType: { carryable: true }
      });

      // Expect an error to be thrown when calling dropAtFeet on a mob without position
      expect(() => {
        item.dropAtFeet(mobWithoutPosition);
      }).toThrow('Mob has no position');
    });

    test('Should throw an error when the item has no position', () => {
      // Create a mob with position
      const mobWithPosition = mobFactory_1.mobFactory.makeMob(
        'blob',
        { x: 0, y: 0 },
        '2',
        'testBlob'
      );

      // Create an item without position
      const itemWithoutPosition = new carryable_1.Carryable({
        id: 'item2',
        itemType: { carryable: true }
      });
      itemWithoutPosition.position = undefined; // Ensure no position for the item

      // Call dropAtFeet
      expect(() => {
        itemWithoutPosition.dropAtFeet(mobWithPosition);
      }).toThrow('Item has no position');
    });
  });
});
afterEach(() => {
  database_1.DB.close();
});
