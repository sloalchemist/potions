export const Colors = {
  COLOR_1: 0xda0a38,
  COLOR_1_DARK: 0x7a0733,
  COLOR_2: 0xf2e51a,
  COLOR_3: 0xf489f6,
  COLOR_3_DARK: 0xd840fb,
  COLOR_3_DARKER: 0x780bf7
} as const satisfies Record<string, number>;

export type SwappableColors = keyof typeof Colors;

export class PaletteSwapper {
  private spritesCreated = new Set<string>();

  // Convert RGB to Hexadecimal
  rgbToHex(r: number, g: number, b: number): number {
    return (r << 16) | (g << 8) | b;
  }

  // Convert Hexadecimal to RGB
  hexToRgb(hex: number): { r: number; g: number; b: number } {
    return {
      r: (hex >> 16) & 0xff,
      g: (hex >> 8) & 0xff,
      b: hex & 0xff
    };
  }

  swapAnimationPalette(
    scene: Phaser.Scene,
    originalAnimKey: string,
    newAnimKey: string,
    atlas: string,
    colorSwaps: Partial<Record<SwappableColors, number>>
  ) {
    if (scene.anims.exists(newAnimKey)) {
      return; // Animation already exists
    }

    const originalAnim = scene.anims.get(originalAnimKey);
    if (!originalAnim) {
      console.error(`Animation with key ${originalAnimKey} not found.`);
      return;
    }

    const newFrames: Phaser.Types.Animations.AnimationFrame[] = [];

    for (const animFrame of originalAnim.frames) {
      const frameName = animFrame.frame.name;
      const newFrameKey = frameName + newAnimKey;

      if (!this.spritesCreated.has(newFrameKey)) {
        this.swapPalette(scene, atlas, frameName, newFrameKey, colorSwaps);
      }

      newFrames.push({
        key: newFrameKey
      });
    }

    scene.anims.create({
      key: newAnimKey,
      frames: newFrames,
      frameRate: originalAnim.frameRate,
      repeat: originalAnim.repeat
    });
  }

  swapPalette(
    scene: Phaser.Scene,
    atlas: string,
    originalSprite: string,
    newSprite: string,
    colorSwaps: Partial<Record<SwappableColors, number>>
  ) {
    if (this.spritesCreated.has(newSprite)) {
      return; // Sprite already created
    }

    const texture = scene.textures.get(atlas).get(originalSprite);
    if (!texture) {
      console.error(`Texture not found: ${atlas} - ${originalSprite}`);
      return;
    }

    const { width, height } = texture;

    const canvasTexture = scene.textures.createCanvas(newSprite, width, height);
    if (!canvasTexture) {
      console.error('Failed to create canvas texture');
      return;
    }

    canvasTexture.drawFrame(atlas, originalSprite);

    const context = canvasTexture.getContext();
    const imageData = context.getImageData(0, 0, width, height);

    for (let i = 0; i < imageData.data.length; i += 4) {
      const currentHex = this.rgbToHex(
        imageData.data[i],
        imageData.data[i + 1],
        imageData.data[i + 2]
      );

      for (const [key, targetHex] of Object.entries(colorSwaps)) {
        const targetColor = key as SwappableColors;
        if (currentHex === Colors[targetColor]) {
          const { r, g, b } = this.hexToRgb(targetHex);

          imageData.data[i] = r;
          imageData.data[i + 1] = g;
          imageData.data[i + 2] = b;
        }
      }
    }

    context.putImageData(imageData, 0, 0);
    canvasTexture.refresh();

    this.spritesCreated.add(newSprite);
  }

  static instance = new PaletteSwapper();
  static getInstance() {
    return PaletteSwapper.instance;
  }
}
