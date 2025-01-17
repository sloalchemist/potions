import { Item } from '../../src/items/item';
import { ItemGenerator } from '../../src/items/itemGenerator';
import { commonSetup } from '../testSetup';
import { DB } from '../../src/services/database';
import { spawn } from 'child_process';
import { error } from 'console';
import exp from 'constants';


beforeAll(() => {
    commonSetup();
});

describe("Items should spawn according to global and local max", () => {
    test("Should not spawn when local max is met", () => {
        const worldDescription = {
            tiles: [
                [0, 0],
                [0, 0]
            ],
            terrain_types: [],
            item_types: [
                {
                    type: "blueberry-bush",
                    name: "Blueberry bush",
                    description: "A shrub that produces small, sweet blueberries.",
                    carryable: false,
                    walkable: false,
                    smashable: false,
                    interactions: [],
                    on_tick: [
                        {
                            action: "spawn_item",
                            parameters: {
                                type: "blueberry",
                                global_max: 10,
                                local_max: 1, // This is important for test
                                radius: 3,
                                rate: 2 // Ensures item spawns every tick
                            }
                        }
                    ]
                },
                {
                    type: "blueberry",
                    name: "Blueberry",
                    description: "A small, round fruit that grows in clusters on bushes.",
                    carryable: true,
                    walkable: true,
                    smashable: true,
                    attributes: [],
                    interactions: []
                }
            ],
            mob_types: []
        };
    
        // Item generation is tested elsewhere
        const itemGenerator = new ItemGenerator(worldDescription.item_types);
        const pos = { x: 0, y: 0 };
        itemGenerator.createItem({
            type: 'blueberry-bush',
            position: pos
        });
        const spawnerId = Item.getItemIDAt(pos);
        const spawner = Item.getItem(spawnerId!)!;
        
        // Ensure spawner spawns on tick
        spawner.tick();
        const count1 = Item.countTypeOfItem("blueberry");
        expect(count1).toBe(1);
    
        // Ensure spawner does not spawn when local max is met, even when global max is not
        spawner.tick();
        const count2 = Item.countTypeOfItem("blueberry");
        expect(count2).toBe(1);
    });
});


afterAll(() => {
    DB.close();
});