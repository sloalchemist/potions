// import { Item } from '../src/world/item';
// import { ItemI } from '../../common/src/item';
// import { SpriteItem } from '../src/sprite/sprite_item';
// import { WorldScene } from '../src/scenes/worldScene';

describe('Fence health bar updates with state', () => {
    let SpriteItem: jest.Mock;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
        jest.mock('../../src/scenes/worldScene', () => ({
            WorldScene: class MockWorldScene { },
        }));

        jest.mock('phaser', () => ({
            Scene: class MockScene {
                key: string;

                constructor(config: { key: string }) {
                    this.key = config.key;
                }

                add = {
                    graphics: () => ({
                        fillStyle: jest.fn(e => e).mockReturnThis(),
                        fillRect: jest.fn(e => e),
                    }),
                };

                game = {
                    scale: {
                        width: 800,
                        height: 600,
                    },
                };
            },
        }));

    });

    test('Fence health logic returns correctly', () => {
        const { SpriteItem: OriginalSpriteItem } = jest.requireActual('../../src/sprite/sprite_item');

        SpriteItem = jest.fn().mockImplementation((maxHealth: number, health: number) => {
            return {
                attributes: { health },
                maxHealth,
                isBelowMaxHealth: OriginalSpriteItem.prototype.isBelowMaxHealth.bind({
                    attributes: { health },
                    maxHealth,
                }),
                calculateHealthPercentage: OriginalSpriteItem.prototype.calculateHealthPercentage.bind({
                    attributes: { health },
                    maxHealth,
                })
            };
        });

        const fenceMaxHealth = 100;

        const fullHealthFence = new SpriteItem(fenceMaxHealth, fenceMaxHealth);
        expect(fullHealthFence.isBelowMaxHealth()).toBe(false);
        expect(fullHealthFence.calculateHealthPercentage()).toBe(1);


        const halfHealthFence = new SpriteItem(fenceMaxHealth, fenceMaxHealth / 2);
        expect(halfHealthFence.isBelowMaxHealth()).toBe(true);
        expect(halfHealthFence.calculateHealthPercentage()).toBe(0.5);

    });

    test('Health bar constructor', () => {
        const { SpriteItem: OriginalSpriteItem } = jest.requireActual('../../src/sprite/sprite_item');


        SpriteItem = jest.fn().mockImplementation((maxHealth: number, health: number) => {
            return {
                if(itemType.layout_type === 'fence' || itemType.layout_type === 'wall'){

            attributes
            healthBar = scene.add.graphics();
            maxHealth = Number(attributes['health']);

        }
        healthBar ?: Phaser.GameObjects.Graphics,
            maxHealth ?: number,
            attributes: { health },
    }
        });





    });

});
