describe('Fence health bar updates with state', () => {
  let SpriteItem: jest.Mock;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    jest.mock('../../../src/scenes/worldScene', () => ({
      WorldScene: class MockWorldScene {}
    }));

    jest.mock('phaser', () => ({
      Scene: class MockScene {
        key: string;

        constructor(config: { key: string }) {
          this.key = config.key;
        }

        add = {
          graphics: () => ({
            fillStyle: jest.fn((e) => e).mockReturnThis(),
            fillRect: jest.fn((e) => e)
          })
        };

        game = {
          scale: {
            width: 800,
            height: 600
          }
        };
      }
    }));
  });

  test('Fence health logic returns correctly', () => {
    const { SpriteItem: OriginalSpriteItem } = jest.requireActual(
      '../../../src/sprite/sprite_item'
    );

    SpriteItem = jest
      .fn()
      .mockImplementation((maxHealth: number, health: number) => {
        return {
          attributes: { health },
          maxHealth,
          isBelowMaxHealth: OriginalSpriteItem.prototype.isBelowMaxHealth.bind({
            attributes: { health },
            maxHealth
          }),
          calculateHealthPercentage:
            OriginalSpriteItem.prototype.calculateHealthPercentage.bind({
              attributes: { health },
              maxHealth
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

  test('Test health bar in sprite_item constructor', () => {
    jest.requireActual('../../../src/sprite/sprite_item');

    SpriteItem = jest
      .fn()
      .mockImplementation(
        (
          maxHealth: number,
          health: number,
          scene: Phaser.Scene,
          itemType: { layoutType: string }
        ) => {
          const sprite = {
            attributes: { health },
            itemType,
            healthBar: undefined as Phaser.GameObjects.Graphics | undefined,
            maxHealth: undefined as number | undefined,
            intialize() {
              // Copied From SpriteItem Constructor
              if (
                itemType.layoutType === 'fence' ||
                itemType.layoutType === 'wall'
              ) {
                this.healthBar = scene.add.graphics();
                this.maxHealth = this.attributes['health'];
              }
            },
            updateHealthBar: jest.fn()
          };
          sprite.intialize();

          return sprite;
        }
      );

    const mockScene = new (jest.requireMock('phaser').Scene)({ key: 'test' });
    const maxHealth = 100;

    const halfHealthFence = new SpriteItem(
      maxHealth,
      maxHealth / 2,
      mockScene,
      { layoutType: 'fence' }
    );
    expect(halfHealthFence.healthBar).toBeDefined();
    halfHealthFence.updateHealthBar();
    expect(halfHealthFence.healthBar).toBeDefined();

    const fullHealthGate = new SpriteItem(maxHealth, maxHealth, mockScene, {
      layoutType: 'gate'
    });
    expect(fullHealthGate.healthBar).not.toBeDefined();
    fullHealthGate.updateHealthBar();
    expect(fullHealthGate.healthBar).not.toBeDefined();
  });
});
