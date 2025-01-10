import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
// import { Container } from '../../container';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { Mob } from '../../src/mobs/mob';
import { ItemGenerator } from '../../src/items/itemGenerator';
import exp from 'constants';
// This is what im tryina do

beforeAll(() => {
  commonSetup();
});

describe('Adds item to a container matching the container item subtype', () => {
  test('Should add the potion', () => {
    const worldDescription = {
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [],
      item_types: [
        {
          name: 'Potion',
          description: 'A magical concoction',
          type: 'potion',
          subtype: '255',
          carryable: true,
          walkable: true,
          interactions: [],
          attributes: [],
          on_tick: []
        },

        {
          name: 'Potion stand',
          description: 'A stand that sells health potions.',
          type: 'potion-stand',
          carryable: false,
          smashable: true,
          walkable: true,
          show_price_at: {
            x: 7,
            y: -10
          },

          subtype: '255',
          interactions: [
            {
              description: 'Add $item_name',
              action: 'add_item',
              while_carried: false
            }
          ],
          attributes: [
            {
              name: 'items',
              value: 0
            },
            {
              name: 'price',
              value: 10
            },
            {
              name: 'gold',
              value: 0
            },
            {
              name: 'health',
              value: 1
            }
          ],
          on_tick: []
        }
      ],
      mob_types: [
        {
          name: 'Player',
          description: 'The player',
          name_style: 'norse-english',
          type: 'player',
          health: 100,
          speed: 2.5,
          attack: 5,
          gold: 0,
          community: 'alchemists',
          stubbornness: 20,
          bravery: 5,
          aggression: 5,
          industriousness: 40,
          adventurousness: 10,
          gluttony: 50,
          sleepy: 80,
          extroversion: 50
        }
      ]
    };

    //set up the world
    const standPosition = { x: 0, y: 1 };
    const position = { x: 0, y: 0 };

    //create a potion stand
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    itemGenerator.createItem({
      type: 'potion-stand',
      position: standPosition
    });
    const standID = Item.getItemIDAt(standPosition);
    expect(standID).not.toBeNull();
    const stand = Item.getItem(standID!);
    expect(stand).not.toBeNull();

    // create a potion
    itemGenerator.createItem({
      type: 'potion',
      subtype: '255',
      position: { x: 1, y: 0 }
    });

    // create a player
    // mobFactory.makeMob('player', position, '79e0aef2', 'TestPlayer');
    // const testMob = Mob.getMob('79e0aef2');
    // expect(testMob).not.toBeNull();

    // const testMob = Mob.getMob('79e0aef2');
    // const testItem = Item.getItem('d39dd773-0200-4b04-909c-68c557cc50b9');

    // const testAddItem = new AddItem();

    // const test = testAddItem.interact(testMob, testItem);

    // expect(test).toBe(true);
  });
});

// describe('Add potions to stand', () => {
//   test('should add red potion to red potion stand', () => {
//     const worldDescription = {
//       tiles: [
//         [-1, -1],
//         [-1, -1]
//       ],
//       terrain_types: [],
//       item_types: [
//         {
//           name: 'Potion',
//           description: 'A magical concoction',
//           type: 'potion',
//           subtype: '255',
//           carryable: true,
//           walkable: true,
//           interactions: [],
//           attributes: [],
//           on_tick: []
//         },
//         {
//           name: 'Potion Stand',
//           description: 'A stand that sells potions',
//           type: 'potion-stand',
//           carryable: false,
//           walkable: false,
//           interactions: [
//             {
//               description: 'Add $item_name',
//               action: 'add_item',
//               while_carried: false
//             }
//           ],
//           attributes: [],
//           on_tick: []
//         }
//       ],
//       mob_types: [
//         {
//           name: 'TestPlayer',
//           type: 'player'
//         }
//       ]
//     };
//     //const world = new ServerWorld(worldDescription);

//     //set up the world
//     const standPosition = { x: 0, y: 1 };
//     const position = { x: 0, y: 0 };

//     //create a potion stand
//     const itemGenerator = new ItemGenerator(worldDescription.item_types);
//     itemGenerator.createItem({
//       type: 'potion-stand',
//       position: standPosition
//     });
//     const standID = Item.getItemIDAt(standPosition);
//     const stand = Item.getItem(standID!);
//     expect(stand).not.toBeNull();

//     //create a potion
//     itemGenerator.createItem({
//       type: 'potion',
//       subtype: '255',
//       position: { x: 1, y: 0 }
//     });
//     const potionID = Item.getItemIDAt({ x: 1, y: 0 });
//     const potion = Item.getItem(potionID!);
//     expect(potion).not.toBeNull();

//     //create a player
//     mobFactory.makeMob('player', position, '79e0aef2', 'TestPlayer');
//     const testMob = Mob.getMob('79e0aef2');
//     expect(testMob).not.toBeNull();
//   });
// });

afterAll(() => {
  DB.close();
});
