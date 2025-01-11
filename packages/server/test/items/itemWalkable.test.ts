import { Item } from '../../src/items/item';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';


beforeAll(() => {
    commonSetup("data/walk.db");
});

describe('Cauldron made not walkable', () => {

    test('Check that non walkable items cannot be walked into', () => {
        const worldDescription = {
            tiles: [
                [0, 0],
                [0, 0]
            ],
            terrain_types: [],
            item_types: [
                {
                    name: 'Cauldron',
                    description: 'For mixing potions',
                    type: 'cauldron',
                    carryable: true,
                    walkable: false,
                    interactions: [],
                    attributes: [],
                    on_tick: []
                }
            ],
            mob_types: []
        };

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

    test('Check you can still brew potions', () => {
        const worldDescription = {
            tiles: [
                [0, 0],
                [0, 0]
            ],
            terrain_types: [],
            item_types: [
                {
                    name: 'Cauldron',
                    description: 'For mixing potions',
                    type: 'cauldron',
                    carryable: true,
                    walkable: false, // This is what matters
                    interactions: [],
                    attributes: [],
                    on_tick: []
                },
                {
                    name: 'Heart Beet',
                    description: 'A heart-shaped beet',
                    type: 'heart-beet',
                    carryable: true,
                    walkable: true,
                    interactions: [
                        {
                            "description": "Brew red potion",
                            "action": "brew",
                            "while_carried": true,
                            "requires_item": "cauldron"
                        },
                    ],
                    attributes: [],
                    on_tick: []
                  }
            ],
            mob_types: []
        };

        // Item generation is tested elsewhere
        const itemGenerator = new ItemGenerator(worldDescription.item_types);
        const cposition = { x: 0, y: 0 };
        const hposition = { x: 0, y: 1 };
        itemGenerator.createItem({
            type: 'cauldron',
            position: cposition
        });
        itemGenerator.createItem({
            type: 'heart-beet',
            position: hposition
        });
        const cauldronID = Item.getItemIDAt(cposition);
        const cauldron = Item.getItem(cauldronID!);
        expect(cauldron?.itemType.walkable).toBe(false);
    });
});

afterAll(() => {
    DB.close();
});