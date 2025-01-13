import { SpriteItem } from '../src/sprite/sprite_item';
import { Item } from '../src/world/item';
import { ItemI } from '../../common/src/item';
//import {} from '../src/scenes/loadWorldScene';
// import { ItemGenerator } from '../../server/src/items/itemGenerator';
// import { commonSetup } from '../testSetup';
// import { DB } from '../../server/src/services/database';
// import { Item } from '../../src/items/item';

describe('Generate fence health bar', () => {
    test('Fence bar loaded into scene', () => {
        let fenceItem : ItemI;
        fenceItem = {
            id: '1',
            name: 'fence',
            type: 'fence',
            subtype: 'barrier',
            position: { x:1, y:1 },
            attributes: { 'name': 'health', 'value': 100}
        }
        
    });
});

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
