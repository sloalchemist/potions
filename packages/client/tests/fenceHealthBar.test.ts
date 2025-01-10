// import { ItemGenerator } from '../../src/items/itemGenerator';
// import { commonSetup } from '../testSetup';
// import { DB } from '../../src/services/database';
// import { Item } from '../../src/items/item';

// beforeAll(() => {
//     commonSetup();
// });

// describe('Generate fence health bar', () => {
//     test('should generate fence', () => {
//         const worldDescription = {
//             tiles: [
//                 [-1, -1],
//                 [-1, -1]
//             ],
//             terrain_types: [],
//             item_types: [
//                 {
//                     "name": "Fence",
//                     "type": "fence",
//                     "description": "A simple barrier to mark boundaries or restrict movement.",
//                     "carryable": false,
//                     "walkable": false,
//                     "smashable": true,
//                     "attributes": [
//                         {
//                             "name": "health",
//                             "value": 100
//                         }
//                     ],
//                     "interactions": []

//                 }
//             ],
//             mob_types: []
//         };
//         const itemGenerator = new ItemGenerator(worldDescription.item_types);
//         //const world = new ServerWorld(worldDescription);
//         const position = { x: 0, y: 0 };
//         itemGenerator.createItem({
//             type: 'fence',
//             position
//         });
//         const fenceID = Item.getItemIDAt(position);
//         expect(fenceID).not.toBeNull();
//         const fenceID = Item.getItem(fenceID!);
//         expect(fenceID).not.toBeNull();
//         expect(fenceID!.type).toBe('fence');
//     });
// });

// afterAll(() => {
//     DB.close();
// });
