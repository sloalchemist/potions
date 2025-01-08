import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
// import { Container } from '../../container';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
// This is what im tryina do

beforeAll(() => {
  commonSetup();
});

// describe('Adds item to a container matching the container item subtype', () => {
//   test('Should add the potion', () => {
//     const testMob = Mob.getMob('79e0aef2');
//     const testItem = Item.getItem('d39dd773-0200-4b04-909c-68c557cc50b9');

//     const testAddItem = new AddItem();

//     const test = testAddItem.interact(testMob, testItem);

//     expect(test).toBe(true);
//   });
// });

describe('Add potions to stand', () => {
  test('should add red potion to red potion stand', () => {
    const worldDescription = {
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [],
      item_types: [],
      mob_types: [{
        name: "TestPlayer",
        type: "player"
      }]
    };
    //const world = new ServerWorld(worldDescription);
    const position = { x: 0, y: 0 };
    mobFactory.makeMob('player', position)
    
  });
});

afterAll(() => {
  DB.close();
});
