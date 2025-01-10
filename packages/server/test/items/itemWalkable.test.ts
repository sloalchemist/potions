import { Item } from '../../src/items/item';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';

beforeAll(() => {
    commonSetup();
});

test('Check that non walkable items cannot be walked to', () => {
    const worldDescription = {
        tiles: [
          [0, 0],
          [0, 0]
        ],
        terrain_types: [],
        item_types: [
          {
            name: 'Solid Object',
            description: 'test',
            type: 'solid object',
            carryable: true,
            walkable: false, // This is what matters
            interactions: [],
            attributes: [],
            on_tick: []
          }
        ],
        mob_types: []
    };

    // Item generation is tested elsewhere
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    const position = { x: 0, y: 0 };
    itemGenerator.createItem({
        type: 'solid object',
        position
    });
    const id = Item.getItemIDAt(position);
    const solid_object = Item.getItem(id!);

    expect(solid_object?.itemType.walkable).toBe(false);
});

afterAll(() => {
    DB.close();
});