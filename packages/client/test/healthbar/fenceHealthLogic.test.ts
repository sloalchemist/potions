// import { Item } from '../src/world/item';
// import { ItemI } from '../../common/src/item';
// import { SpriteItem } from '../src/sprite/sprite_item';
// import { WorldScene } from '../src/scenes/worldScene';

describe('Fence health bar updates with state', () => {
    let SpriteItem : jest.Mock;

    beforeEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    
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
        
    });

    test('Fence health ogic returns correctly', () => {
        const fenceMaxHealth = 100;

        const fullHealthFence = new SpriteItem( fenceMaxHealth, fenceMaxHealth );
        expect(fullHealthFence.isBelowMaxHealth()).toBe(false);
        expect(fullHealthFence.calculateHealthPercentage()).toBe(1);

        
        const halfHealthFence = new SpriteItem( fenceMaxHealth, fenceMaxHealth /2 );
        expect(halfHealthFence.isBelowMaxHealth()).toBe(true);
        expect(halfHealthFence.calculateHealthPercentage()).toBe(0.5);

    });
});
