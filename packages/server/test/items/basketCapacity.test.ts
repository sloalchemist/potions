import { commonSetup, village } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Item } from '../../src/items/item';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Mob } from '../../src/mobs/mob';
import { Community } from '../../src/community/community';
import { log } from 'console';

/* 
    Tests if player is able to add more than 10 logs to basket.
    Need: Player, Basket, Log
*/

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
});


describe('Try to add logs to basket until max capacity is reached', () => {
    // world setup
    const basketPosition = { x: 1, y: 1 };
    const playerPosition = { x: 0, y: 1};
    mobFactory.loadTemplates(worldDescription.mob_types);

    test('check something', () => {
      expect(1).toBe(1);
    })
    

    // create basket
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    itemGenerator.createItem({
      type: 'basket',
      position: basketPosition,
      ownedBy: village,
      attributes: {
        templateType: 'log',
        items: 0,
        capacity: 10
      }
    });
    //const basketID = Item.getItemIDAt(basketPosition);
    //expect(basketID).not.toBeNull();

});