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
});

afterAll(() => {
  DB.close();
});

