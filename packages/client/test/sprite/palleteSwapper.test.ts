import { PaletteSwapper, Colors, SwappableColors } from '../../src/sprite/palette_swapper'

// Mock Phaser objects and types
const mockPutImageData = jest.fn();
const mockGetImageData = jest.fn();
const mockRefresh = jest.fn();
const mockDrawFrame = jest.fn();

class MockCanvasContext {
  putImageData = mockPutImageData;
  getImageData = mockGetImageData;
}

class MockCanvasTexture {
  drawFrame = mockDrawFrame;
  refresh = mockRefresh;
  getContext() {
    return new MockCanvasContext();
  }
}

const mockScene = {
  anims: {
    exists: jest.fn(),
    get: jest.fn(),
    create: jest.fn()
  },
  textures: {
    get: jest.fn(),
    createCanvas: jest.fn()
  }
} as unknown as Phaser.Scene;

describe('PaletteSwapper', () => {
  let paletteSwapper: PaletteSwapper;

  beforeEach(() => {
    paletteSwapper = new PaletteSwapper();
    jest.clearAllMocks();
  });

  describe('rgbToHex', () => {
    it('should correctly convert RGB to hexadecimal', () => {
      expect(paletteSwapper.rgbToHex(218, 10, 56)).toBe(Colors.COLOR_1);
      expect(paletteSwapper.rgbToHex(242, 229, 26)).toBe(Colors.COLOR_2);
      expect(paletteSwapper.rgbToHex(244, 137, 246)).toBe(Colors.COLOR_3);
    });
  });

  describe('hexToRgb', () => {
    it('should correctly convert hexadecimal to RGB', () => {
      const result = paletteSwapper.hexToRgb(Colors.COLOR_1);
      expect(result).toEqual({ r: 218, g: 10, b: 56 });
    });

    it('should handle dark colors correctly', () => {
      const result = paletteSwapper.hexToRgb(Colors.COLOR_1_DARK);
      expect(result).toEqual({ r: 122, g: 7, b: 51 });
    });
  });

  describe('swapAnimationPalette', () => {
    const mockOriginalAnim = {
      frameRate: 24,
      repeat: -1,
      frames: [
        { frame: { name: 'frame1' } },
        { frame: { name: 'frame2' } }
      ]
    };

    beforeEach(() => {
      (mockScene.anims.get as jest.Mock).mockReturnValue(mockOriginalAnim);
    });

    it('should not create animation if it already exists', () => {
      (mockScene.anims.exists as jest.Mock).mockReturnValue(true);
      
      paletteSwapper.swapAnimationPalette(
        mockScene,
        'originalAnim',
        'newAnim',
        'atlas',
        { COLOR_1: 0xff0000 }
      );

      expect(mockScene.anims.create).not.toHaveBeenCalled();
    });

    // it('should create new animation with swapped palette', () => {
    //   (mockScene.anims.exists as jest.Mock).mockReturnValue(false);
      
    //   paletteSwapper.swapAnimationPalette(
    //     mockScene,
    //     'originalAnim',
    //     'newAnim',
    //     'atlas',
    //     { COLOR_1: 0xff0000 }
    //   );

    //   expect(mockScene.anims.create).toHaveBeenCalledWith({
    //     key: 'newAnim',
    //     frames: [
    //       { key: 'frame1newAnim' },
    //       { key: 'frame2newAnim' }
    //     ],
    //     frameRate: 24,
    //     repeat: -1
    //   });
    // });

    it('should handle missing original animation', () => {
      (mockScene.anims.exists as jest.Mock).mockReturnValue(false);
      (mockScene.anims.get as jest.Mock).mockReturnValue(null);
      
      const consoleSpy = jest.spyOn(console, 'error');
      
      paletteSwapper.swapAnimationPalette(
        mockScene,
        'missingAnim',
        'newAnim',
        'atlas',
        { COLOR_1: 0xff0000 }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Animation with key missingAnim not found.'
      );
      expect(mockScene.anims.create).not.toHaveBeenCalled();
    });
  });

  describe('swapPalette', () => {
    const mockTexture = {
      width: 64,
      height: 64
    };

    beforeEach(() => {
      (mockScene.textures.get as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(mockTexture)
      });
      (mockScene.textures.createCanvas as jest.Mock).mockReturnValue(new MockCanvasTexture());
      
      mockGetImageData.mockReturnValue({
        data: new Uint8ClampedArray(64 * 64 * 4)
      });
    });

    it('should not process if sprite already exists', () => {
      paletteSwapper.swapPalette(
        mockScene,
        'atlas',
        'sprite',
        'existingSprite',
        { COLOR_1: 0xff0000 }
      );
      
      paletteSwapper.swapPalette(
        mockScene,
        'atlas',
        'sprite',
        'existingSprite',
        { COLOR_1: 0xff0000 }
      );

      expect(mockScene.textures.createCanvas).toHaveBeenCalledTimes(1);
    });

    it('should handle missing texture', () => {
      (mockScene.textures.get as jest.Mock).mockReturnValue({
        get: jest.fn().mockReturnValue(null)
      });
      
      const consoleSpy = jest.spyOn(console, 'error');
      
      paletteSwapper.swapPalette(
        mockScene,
        'atlas',
        'missingSprite',
        'newSprite',
        { COLOR_1: 0xff0000 }
      );

      expect(consoleSpy).toHaveBeenCalledWith(
        'Texture not found: atlas - missingSprite'
      );
    });

    it('should handle canvas creation failure', () => {
      (mockScene.textures.createCanvas as jest.Mock).mockReturnValue(null);
      
      const consoleSpy = jest.spyOn(console, 'error');
      
      paletteSwapper.swapPalette(
        mockScene,
        'atlas',
        'sprite',
        'newSprite',
        { COLOR_1: 0xff0000 }
      );

      expect(consoleSpy).toHaveBeenCalledWith('Failed to create canvas texture');
    });

    it('should swap colors correctly', () => {
      const imageData = new Uint8ClampedArray(64 * 64 * 4);
      // Set some pixels to COLOR_1
      const color1Rgb = paletteSwapper.hexToRgb(Colors.COLOR_1);
      imageData[0] = color1Rgb.r;
      imageData[1] = color1Rgb.g;
      imageData[2] = color1Rgb.b;
      imageData[3] = 255; // Alpha

      mockGetImageData.mockReturnValue({ data: imageData });

      paletteSwapper.swapPalette(
        mockScene,
        'atlas',
        'sprite',
        'newSprite',
        { COLOR_1: 0xff0000 }
      );

      expect(mockPutImageData).toHaveBeenCalled();
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = PaletteSwapper.getInstance();
      const instance2 = PaletteSwapper.getInstance();
      expect(instance1).toBe(instance2);
    });
  });
});