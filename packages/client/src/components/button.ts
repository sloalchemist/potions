export const BUTTON_WIDTH = 120;
export const BUTTON_HEIGHT = 40;
export const BUTTON_SPACING = 25;
export const SUBHEADING_OFFSET = 25;
import Phaser from 'phaser';

export class Button extends Phaser.GameObjects.Container {
  buttonSprite: Phaser.GameObjects.Text | Phaser.GameObjects.Sprite;
  buttonBackground?: Phaser.GameObjects.Rectangle;
  texture: string;
  callback: () => void;
  active: boolean = true;
  fixedWidth: number;
  fixedHeight: number;
  interactionSound?: string;
  defaultColor: number;
  hoverColor: number;
  pressedColor: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    treatAsText: boolean,
    texture: string,
    callback: () => void,
    buttonWidth: number = BUTTON_WIDTH,
    buttonHeight: number = BUTTON_HEIGHT,
    interactionSound?: string
  ) {
    super(scene, x, y); // Initialize the container at position (x, y)
    scene.add.existing(this); // Add the container to the scene

    this.texture = texture;
    this.callback = callback;
    this.fixedWidth = buttonWidth;
    this.fixedHeight = buttonHeight;

    this.defaultColor = 0x8ca0b3;
    this.hoverColor = 0xc0d9e8;
    this.pressedColor = 0x5e7485;

    if (interactionSound) {
      this.interactionSound = interactionSound;
    }

    if (treatAsText) {
      // Create the background rectangle
      this.buttonBackground = new Phaser.GameObjects.Rectangle(
        scene,
        0, // Centered in the container
        0,
        this.fixedWidth,
        this.fixedHeight,
        this.defaultColor // Background color
      ).setOrigin(0.5);

      // Create the text object
      this.buttonSprite = new Phaser.GameObjects.Text(scene, 0, 0, texture, {
        fontSize: '15px',
        color: '#ffffff',
        padding: { x: 10, y: 5 },
        wordWrap: { width: this.fixedWidth - 20, useAdvancedWrap: true }
      }).setOrigin(0.5);

      // Adjust text to fit dimensions
      this.fitTextToDimensions(this.fixedWidth, this.fixedHeight);

      // Add border to background
      this.buttonBackground.setStrokeStyle(2, 0xffffff);

      // Add both background and text to the container
      this.add([this.buttonBackground, this.buttonSprite]);
      this.setSize(this.fixedWidth, this.fixedHeight);
    } else {
      // For sprite-based buttons
      this.buttonSprite = new Phaser.GameObjects.Sprite(
        scene,
        0,
        0,
        texture
      ).setOrigin(0.5);
      this.add(this.buttonSprite);
      this.setSize(this.buttonSprite.width, this.buttonSprite.height);
    }

    // Set the size of the container and make it interactive
    this.setInteractive();

    // Prevent the button from moving with the camera
    this.setScrollFactor(0);

    // Add interactive behavior
    this.setupInteractive();
  }

  private setupInteractive() {
    this.on('pointerover', () => {
      this.buttonSprite.setScale(1.1);
      this.buttonBackground?.setScale(1.05);
      this.buttonBackground?.setFillStyle(this.hoverColor); // Hover color
    });

    this.on('pointerout', () => {
      this.buttonSprite.setScale(1.0);
      this.buttonBackground?.setScale(1.0);
      this.buttonBackground?.setFillStyle(this.defaultColor); // Default color
    });

    this.on(
      'pointerdown',
      (
        pointer: Phaser.Input.Pointer,
        localX: number,
        localY: number,
        event: Phaser.Types.Input.EventData
      ) => {
        event.stopPropagation();
        if (this.scene.registry.get('soundEffects') === true) {
          this.scene.sound.play('buttonClick');
        }
        this.buttonSprite.setScale(0.9);
        this.buttonBackground?.setScale(0.95);
        this.buttonBackground?.setFillStyle(this.pressedColor); // Pressed color
      }
    );

    this.on('pointerup', () => {
      this.buttonSprite.setScale(1.1);
      this.buttonBackground?.setScale(1.05);
      this.buttonBackground?.setFillStyle(this.hoverColor); // Hover color
      this.callback();
      // play interaction sound
      if (
        this.scene.registry.get('soundEffects') === true &&
        this.interactionSound
      ) {
        this.scene.sound.play(this.interactionSound);
      }
    });
  }

  /**
   * Adjust the text size to fit within the fixed dimensions, trying word wrap first
   */
  private fitTextToDimensions(fixedWidth: number, fixedHeight: number) {
    const textObject = this.buttonSprite as Phaser.GameObjects.Text;

    // Enable word wrap within the fixed width
    textObject.setStyle({
      wordWrap: { width: fixedWidth - 20, useAdvancedWrap: true }
    });

    // Start with the default font size
    let fontSize = parseInt(textObject.style.fontSize.toString() || '15', 10);

    // Reduce font size until text height fits within the fixed height
    while (textObject.height > fixedHeight - 10) {
      fontSize -= 1;
      if (fontSize <= 10) {
        fontSize = 10;
        break;
      }
      textObject.setFontSize(fontSize);
    }
  }

  /**
   * Implement the setStyle method to dynamically change button styles
   */
  setStyle(style: {
    backgroundColor?: {
      default: string;
      hover: string;
      pressed: string;
    };
    color?: string;
  }) {
    if (style.backgroundColor !== undefined && this.buttonBackground) {
      // Convert the color strings to Phaser color numbers
      const defaultColorNumber = Phaser.Display.Color.HexStringToColor(
        style.backgroundColor.default
      ).color;
      this.buttonBackground.setFillStyle(defaultColorNumber);
      this.defaultColor = defaultColorNumber;

      this.hoverColor = Phaser.Display.Color.HexStringToColor(
        style.backgroundColor.hover
      ).color;

      this.pressedColor = Phaser.Display.Color.HexStringToColor(
        style.backgroundColor.pressed
      ).color;
    }

    if (
      style.color !== undefined &&
      this.buttonSprite instanceof Phaser.GameObjects.Text
    ) {
      this.buttonSprite.setStyle({ color: style.color });
    }
  }

  destroy() {
    super.destroy(true); // Destroy all children as well
  }
}
