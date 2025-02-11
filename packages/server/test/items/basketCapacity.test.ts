import { commonSetup, itemGenerator, world } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Item } from '../../src/items/item';
import { Container } from '../../src/items/container';
import { Carryable } from '../../src/items/carryable';
import { Coord } from '@rt-potion/common';
import { Mob } from '../../src/mobs/mob';
import { Community } from '../../src/community/community';
/* 
    Tests if mob can add to basket over capacity
*/
beforeAll(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  mobFactory.loadTemplates(world.mobTypes);
});gi

describe('Try to add logs to basket until max capacity is reached', () => {
  test('Should Limit added items to container', () => {
    //Generate initial mob, basket with 1 capacity, and Item
    const position: Coord = { x: 0, y: 0 };
    const mobId = 'testmob';
    mobFactory.makeMob('player', position, mobId, 'testPlayer');
    const testMob = Mob.getMob(mobId)!;
    // eslint-disable-next-line prettier/prettier
    itemGenerator.createItem({ "type": "basket", "position": { "x": 1, "y": 0 }, "attributes": {"itemType": "log", "count": 0, "capacity": 1, "templateType" : "log" }});
    const basketId = Item.getItemIDAt({ x: 1, y: 0 });
    const testBasket1 = Item.getItem(basketId!)!;
    const testBasket = Container.fromItem(testBasket1)!;
    itemGenerator.createItem({ type: 'log', position: { x: 0, y: 0 } });
    let logId = Item.getItemIDAt({ x: 0, y: 0 });
    let log = Carryable.fromItem(Item.getItem(logId!)!)!;
    expect(testBasket).not.toBeUndefined();
    //Gives Item to Mob
    log.pickup(testMob);
    expect(testBasket.getInventory()).toBe(0);
    //Tests adding one item, within capacity
    let adder = testBasket.placeItem(testMob);
    expect(adder).toBe(true);
    expect(testBasket.getInventory()).toBe(1);
    expect(testMob.carrying).toBe(undefined);
    itemGenerator.createItem({ type: 'log', position: { x: 0, y: 0 } });
    logId = Item.getItemIDAt({ x: 0, y: 0 });
    log = Carryable.fromItem(Item.getItem(logId!)!)!;
    log.pickup(testMob);
    expect(testMob.carrying).not.toBeUndefined();
    //Tests adding one item, above capacity
    adder = testBasket.placeItem(testMob);
    expect(adder).toBe(false);
    expect(testBasket.getInventory()).toBe(1);
    expect(testMob.carrying).not.toBeUndefined();
  });
});
