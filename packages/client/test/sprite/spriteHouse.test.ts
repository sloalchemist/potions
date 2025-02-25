import { SpriteHouse } from '../../src/sprite/sprite_house';
import { Coord, HouseI } from '@rt-potion/common';
import { WorldScene } from '../../src/scenes/worldScene';
import { World } from '../../src/world/world';

// Mock Phaser sprite
class MockSprite {
  x: number;
  y: number;
  frame: string = '';
  depth: number = 0;
  alpha: number;
  destroyed: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.alpha = 1;
  }

  setFrame(frame: string) {
    this.frame = frame;
    return this;
  }

  setDepth(depth: number) {
    this.depth = depth;
    return this;
  }

  setAlpha(alpha: number) {
    this.alpha = alpha;
    return this;
  }

  destroy() {
    this.destroyed = true;
  }
}

// Mock WorldScene
const mockWorldScene = {
  add: {
    sprite: jest.fn()
  },
  convertToWorldXY: jest.fn()
} as unknown as WorldScene;

describe('SpriteHouse', () => {
  let spriteHouse: SpriteHouse;
  let mockHouse: HouseI;
  const createdSprites: MockSprite[] = [];

  beforeEach(() => {
    // Reset mocks and sprites array
    jest.clearAllMocks();
    createdSprites.length = 0;

    // Setup mock house data
    mockHouse = {
      id: 'house1',
      top_left: { x: 5, y: 5 },
      width: 3,
      height: 3
    };

    // Mock sprite creation
    (mockWorldScene.add.sprite as jest.Mock).mockImplementation((x, y) => {
      const sprite = new MockSprite(x, y);
      createdSprites.push(sprite);
      return sprite;
    });

    // Mock coordinate conversion
    (mockWorldScene.convertToWorldXY as jest.Mock).mockImplementation(
      (coord: Coord) => [
        coord.x * 32, // Simulate tile to world conversion
        coord.y * 32
      ]
    );

    spriteHouse = new SpriteHouse(mockWorldScene, mockHouse);
  });

  describe('constructor', () => {
    it('should initialize house properties correctly', () => {
      expect(spriteHouse.key).toBe('house1');
      expect(spriteHouse.top_left).toEqual({ x: 5, y: 5 });
      expect(spriteHouse.width).toBe(3);
      expect(spriteHouse.height).toBe(3);
    });

    // it('should create correct number of floor sprites', () => {
    //   const floorSpriteCount = spriteHouse.floorSprites.length;
    //   // Width - 1 * Height = (3-1) * 3 = 6 floor sprites
    //   expect(floorSpriteCount).toBe(6);
    // });

    it('should set floor sprites to correct depth', () => {
      spriteHouse.floorSprites.forEach((sprite) => {
        expect(sprite.depth).toBe(0.1);
      });
    });

    it('should create all required roof sprites', () => {
      // Check if all roof parts are created with correct frames
      const roofFrames = spriteHouse.roofSprites.map((sprite) => sprite.frame);

      expect(roofFrames).toContain('roof-top-left');
      expect(roofFrames).toContain('roof-top-right');
      expect(roofFrames).toContain('roof-bottom-left');
      expect(roofFrames).toContain('roof-bottom-right');
      expect(roofFrames).toContain('roof-middle-left');
      expect(roofFrames).toContain('roof-middle-right');
    });

    it('should set roof sprites to correct depth', () => {
      spriteHouse.roofSprites.forEach((sprite) => {
        expect(sprite.depth).toBe(100);
      });
    });
  });

  describe('generateRoofSprite', () => {
    it('should create roof sprite with correct properties', () => {
      const coord = { x: 1, y: 1 };
      const frame = 'roof-test';

      spriteHouse.generateRoofSprite(mockWorldScene, coord, frame);

      const lastSprite = createdSprites[createdSprites.length - 1];
      expect(lastSprite.frame).toBe(frame);
      expect(lastSprite.depth).toBe(100);
    });
  });

  describe('animate', () => {
    it('should set roof sprites to full alpha when outside house bounds', () => {
      spriteHouse.animate(0, 0); // Position outside house

      spriteHouse.roofSprites.forEach((sprite) => {
        expect(sprite.alpha).toBe(1);
      });
    });

    it('should set roof sprites to low alpha when inside house bounds', () => {
      spriteHouse.animate(6, 6); // Position inside house

      spriteHouse.roofSprites.forEach((sprite) => {
        expect(sprite.alpha).toBe(0.05);
      });
    });

    it('should handle edge cases at house boundaries', () => {
      // Test at exact boundaries
      spriteHouse.animate(5, 5); // top-left
      expect(spriteHouse.roofSprites[0].alpha).toBe(0.05);

      spriteHouse.animate(8, 8); // bottom-right outside
      expect(spriteHouse.roofSprites[0].alpha).toBe(1);
    });
  });

  describe('destroy', () => {
    it('should destroy all sprites and remove house from world', () => {
      const mockWorld = {
        houses: {
          house1: spriteHouse
        }
      } as unknown as World;

      spriteHouse.destroy(mockWorld);

      // Verify all sprites are destroyed
      spriteHouse.floorSprites.forEach((sprite) => {
        expect((sprite as unknown as MockSprite).destroyed).toBe(true);
      });
      spriteHouse.roofSprites.forEach((sprite) => {
        expect((sprite as unknown as MockSprite).destroyed).toBe(true);
      });

      // Verify house is removed from world
      expect(mockWorld.houses['house1']).toBeUndefined();
    });
  });
});
