import { mobFactory } from '../../src/mobs/mobFactory';
import { Smashable } from '../../src/items/smashable'
import { Community } from "../../src/community/community";
import { commonSetup, itemGenerator, world } from '../testSetup';
import { Item } from '../../src/items/item';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';

describe('Smashing An Item Always Does Damage', () => {
    
    beforeAll(() => {
        commonSetup();
    });

    test('Smash does 1 damge for zero in rng or product of non-zero for rng and mob attack', () => {
        const positionMob = { x: 0, y: 0 };
        const positionItem = { x: 1, y: 1};
        itemGenerator.createItem({
            type: 'fence',
            position: positionItem,
        });

        const fenceID = Item.getItemIDAt(positionItem)
        if (!fenceID) {
            throw new Error(`No item found at ${JSON.stringify(positionItem)}`);
        }
        const fence = Item.getItem(fenceID)
        if (!fence) {
            throw new Error(`No item found with id ${JSON.stringify(fenceID)}`);
        }
        const smashableFence = Smashable.fromItem(fence)
        if (!smashableFence) {
            throw new Error(`No smashable item created from ${JSON.stringify(smashableFence)}`)
        }

        mobFactory.loadTemplates(world.mobTypes)
        Community.makeVillage('alchemists', 'Alchemists guild');
        const mobId = 'testmob';

        mobFactory.makeMob('player', positionMob, mobId, 'testPlayers')
        const playerMob = Mob.getMob(mobId);
        if (!playerMob) {
            throw new Error(`No mob found with id ${JSON.stringify(mobId)}`)
        }
        
        smashableFence.smashItem(playerMob, () => 0);
        expect(fence.getAttribute('health')).toBe(99);
        smashableFence.smashItem(playerMob, () => 0.5);
        expect(fence.getAttribute('health')).toBe(97);
        smashableFence.smashItem(playerMob, () => 1);
        expect(fence.getAttribute('health')).toBe(92);
    });

    afterAll(() => {
        DB.close();
    });

});

// describe('Zero damage hit not possible', () => {
//     let SpriteItem: jest.Mock;

//     beforeEach(() => {
//         jest.resetModules();
//         jest.clearAllMocks();
//         // jest.mock('../../../src/scenes/worldScene', () => ({
//         //     WorldScene: class MockWorldScene { },
//         // }));


//         test('Test zero damage hit', () => {

//             const { testSmashable: smashable } = jest.requireActual('../../src/items/smashable');

//             testSmashable = jest.fn().mockImplementation((attackDmg: number) => {
//                 return {

//                     smashable

//                 };
//             });

//             const fenceMaxHealth = 100;

//             let testFence = new SpriteItem(fenceMaxHealth, fenceMaxHealth);
//             testFence.

//             // expect(fullHealthFence.isBelowMaxHealth()).toBe(false);
//             // expect(fullHealthFence.calculateHealthPercentage()).toBe(1);

//             // const halfHealthFence = new SpriteItem(fenceMaxHealth, fenceMaxHealth / 2);
//             // expect(halfHealthFence.isBelowMaxHealth()).toBe(true);
//             // expect(halfHealthFence.calculateHealthPercentage()).toBe(0.5);

//         });

//         test('Test health bar in sprite_item constructor', () => {
//             jest.requireActual('../../../src/sprite/sprite_item');

//             SpriteItem = jest.fn().mockImplementation((
//                 maxHealth: number, health: number, scene: Phaser.Scene, itemType: { layoutType: string }
//             ) => {
//                 const sprite = {
//                     attributes: { health },
//                     itemType,
//                     healthBar: undefined as Phaser.GameObjects.Graphics | undefined,
//                     maxHealth: undefined as number | undefined,
//                     intialize() {
//                         // Copied From SpriteItem Constructor
//                         if (itemType.layoutType === 'fence' || itemType.layoutType === 'wall') {
//                             this.healthBar = scene.add.graphics();
//                             this.maxHealth = this.attributes['health'];
//                         }
//                     },
//                     updateHealthBar: jest.fn(),
//                 }
//                 sprite.intialize();

//                 return sprite;
//             });

//             const mockScene = new (jest.requireMock('phaser').Scene)({ key: 'test' });
//             const maxHealth = 100;

//             const halfHealthFence = new SpriteItem(maxHealth, maxHealth / 2, mockScene, { layoutType: 'fence' });
//             expect(halfHealthFence.healthBar).toBeDefined();
//             halfHealthFence.updateHealthBar();
//             expect(halfHealthFence.healthBar).toBeDefined();

//             const fullHealthGate = new SpriteItem(maxHealth, maxHealth, mockScene, { layoutType: 'gate' });
//             expect(fullHealthGate.healthBar).not.toBeDefined();
//             fullHealthGate.updateHealthBar();
//             expect(fullHealthGate.healthBar).not.toBeDefined();

//         });
//     });

