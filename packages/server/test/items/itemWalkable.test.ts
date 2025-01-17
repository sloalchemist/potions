import { Item } from '../../src/items/item';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { commonSetup, worldDescription } from '../testSetup';
import { DB } from '../../src/services/database';


beforeAll(() => {
    commonSetup();
});

describe('Cauldron made not walkable', () => {
    test('Check that non walkable items cannot be walked into', () => {

        // Item generation is tested elsewhere
        const itemGenerator = new ItemGenerator(worldDescription.item_types);
        const cposition = { x: 0, y: 0 };
        itemGenerator.createItem({
            type: 'cauldron',
            position: cposition
        });
        const cauldronID = Item.getItemIDAt(cposition);
        const cauldron = Item.getItem(cauldronID!);
        expect(cauldron?.itemType.walkable).toBe(false);
    });

});

afterAll(() => {
    DB.close();
});