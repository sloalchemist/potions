import { ItemGenerator } from '../../src/items/itemGenerator';
import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { Item } from '../../src/items/item';

beforeAll(() => {
  commonSetup("../server/data/itemGenetator.db");
});

describe('Generate heart-beet', () => {
  test('should generate heart-beet', () => {
    const worldDescription = {
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [],
      item_types: [
        {
          name: 'Heart Beet',
          description: 'A heart-shaped beet',
          type: 'heart-beet',
          carryable: true,
          walkable: true,
          interactions: [],
          attributes: [],
          on_tick: []
        }
      ],
      mob_types: []
    };
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    //const world = new ServerWorld(worldDescription);
    const position = { x: 0, y: 0 };
    itemGenerator.createItem({
      type: 'heart-beet',
      position
    });
    const heartBeetID = Item.getItemIDAt(position);
    expect(heartBeetID).not.toBeNull();
    const heartBeet = Item.getItem(heartBeetID!);
    expect(heartBeet).not.toBeNull();
    expect(heartBeet!.type).toBe('heart-beet');
  });
    
  test('Check that non walkable items cannot be walked to', () => {
    const worldDescription = {
        tiles: [
          [-1, -1],
          [-1, -1]
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
    const position = { x: 1, y: 0 };
    itemGenerator.createItem({
        type: 'solid object',
        position
    });
    const id = Item.getItemIDAt(position);
    const solid_object = Item.getItem(id!);
    expect(solid_object?.itemType.walkable).toBeFalsy();
    });
});
afterAll(() => {
  DB.close();
});