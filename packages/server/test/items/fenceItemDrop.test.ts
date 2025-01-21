import { commonSetup } from "../testSetup"; //  Always need to call to init everything
import { itemGenerator, ItemGenerator } from '../../src/items/itemGenerator';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { Smashable } from '../../src/items/smashable';
import { DB } from '../../src/services/database';

//  does our initialize setup
beforeAll(() => {
    commonSetup();
});

describe('Fence Drop Item', () => {
    test('case: drop log when fence is destroyed', () => {
        const worldDescription = {
            tiles: [
                [1, 1],
                [1, 1]
            ],
            terrain_types: [
                {
                    "name": "Grass",
                    "id": 1,
                    "walkable": true
                }
            ],
            //  simply list the items you expect need to be included in your test
            //  see worldMetadata.ts for interfaces
            item_types: [
                {
                    name: 'Log',
                    description: 'Piece of wood',
                    type: 'log',
                    carryable: true,
                    smashable: true,
                    walkable: true,
                    interactions: [
                        {
                            description: 'Build Partial Wall',
                            action: 'build_partial_wall',
                            while_carried: true, 
                            requires_item: 'partial-wall'
                        }
                    ],
                    attributes: [],
                    on_tick: []
                },
                {
                    name: 'Partial Wall',
                    description: 'A partially formed wall',
                    type: 'partial-wall',
                    carryable: false,
                    smashable: true, 
                    walkable: false, 
                    interactions: [],
                    //  set health to 0 as to smash easily
                    attributes: [
                        {
                            name: 'health',
                            value: 0
                        }
                    ],
                    on_tick: []
                },
                {
                    name: 'Wall',
                    description: 'A barrier that provides high level of protection',
                    type: 'wall',
                    carryable: false, 
                    smashable: true,
                    walkable: false, 
                    interactions: [],
                    attributes: [
                        {
                            name: 'health',
                            value: 0
                        }
                    ],
                    on_tick: []
                },
                {
                    name: 'Fence',
                    description: 'A barrier that provides low level of protection',
                    type: 'fence',
                    carryable: false,
                    smashable: true,
                    walkable: false,
                    interactions: [],
                    attributes: [
                        {
                            name: 'health',
                            value: 0
                        }
                    ],
                    on_tick: []
                }
            ],
            //  only testing with player
            mob_types: [
                {
                    name: 'Player',
                    description: 'The player',
                    name_style: 'norse-english',
                    type: 'player',
                    health: 1000,
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
                    extroversion: 50,
                    speaker: true
                },
            ],
            communities: [
                { 
                    id: 'alchemists', 
                    name: 'Alchemists guild', 
                    description: "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."  
                }
            ],
            alliances: [],
            houses: [],
            items: [],
            containers: []
        }//  World Description End
        ItemGenerator.initialize(worldDescription.item_types);

        // Create mobFactory's mobTemplates
        mobFactory.loadTemplates(worldDescription.mob_types);

        // Create community - otherwise foreign key contraint error
        Community.makeVillage('alchemists', 'Alchemists guild');

        // Create ItemGenerator and Potion Stand
        ItemGenerator.initialize(worldDescription.item_types);

        //  create items at desired location
        const mobPosition = { x: 1, y: 1 };
        const wallPosition = { x: 0, y: 1 };
        const fencePosition = { x: 1, y: 0};

        // Create player mob
        mobFactory.makeMob('player', mobPosition, '1', 'testPlayer');
        const testMob = Mob.getMob('1');

        //  Verify mob spawned
        expect(testMob).toBeInstanceOf(Mob);
        expect(testMob).not.toBeNull();
        expect(testMob?.health).toBe(1000);

        //  create partial-wall
        itemGenerator.createItem({
            type: 'partial-wall',
            position: wallPosition
        });

        // testing to see it partialWallId and partialWall were spawned
        const partialWallId = Item.getItemIDAt(wallPosition);
        expect(partialWallId).not.toBeNull();
        const partialWall = Item.getItem(partialWallId!);
        expect(partialWall).toBeDefined();

        //  creating a smashable partialWall
        const smashablePWall = Smashable.fromItem(partialWall!);
        expect(smashablePWall).not.toBeNull();
        smashablePWall?.smashItem(testMob!);

        const logPosition = Item.getItemIDAt(wallPosition);
        expect(logPosition).not.toBeNull();
        const log = Item.getItem(logPosition!);
        expect(log).toBeDefined();
        expect(log?.type).toBe("log");

        //  create fence
        itemGenerator.createItem({
            type: 'fence',
            position: wallPosition
        });

        //  testing to see if fence spawned
        const fenceId = Item.getItemIDAt(fencePosition);
        expect(fenceId).not.toBeNull();
        const fence = Item.getItem(fenceId!);
        expect(fence).toBeDefined();

        //  creating a smashable fence
        const smashableFence = Smashable.fromItem(fence!);
        expect(smashableFence).not.toBeNull();
        smashableFence?.smashItem(testMob!);
        
        const logPosition2 = Item.getItemIDAt(fencePosition);
        expect(logPosition2).not.toBeNull();
        const log2 = Item.getItem(logPosition2!);
        expect(log2).toBeDefined();
        expect(log2?.type).toBe("log")
    })
})

afterAll(() => {
    DB.close();
  });


