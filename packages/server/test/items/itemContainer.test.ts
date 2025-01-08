import { Mob } from '../../src/mobs/mob';
// import { Container } from '../../container';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
// This is what im tryina do


describe('Adds item to a container matching the container item subtype', () => {
  test('Should add the potion', () => {
    const testMob = Mob.getMob('79e0aef2');
    const testItem = Item.getItem('d39dd773-0200-4b04-909c-68c557cc50b9');

    const testAddItem = new AddItem();

    const test = testAddItem.interact(testMob, testItem);

    expect(test).toBe(true);
  });
});
