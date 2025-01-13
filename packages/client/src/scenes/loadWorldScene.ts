import { PaletteSwapper } from '../sprite/palette_swapper';
import { currentCharacter, validateName, changeName, saveColors } from '../worldMetadata';
import {
  darkenColor,
  hexStringToNumber,
  numberToHexString
} from '../utils/color';
import { setupAbly } from '../services/ablySetup';
import { setGameState } from '../world/controller';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';

const buttonStyle = {
  fontSize: '24px',
  color: '#ffffff',
  backgroundColor: '#28a745', // Green background
  padding: {
    x: 20,
    y: 10
  },
  align: 'center'
};

const nameButtonHoverStyle = {
  backgroundColor: '#138496' // Darker teal
};

export class LoadWorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadWorldScene' });
  }

  playerSprite!: Phaser.GameObjects.Sprite;
  paletteSwapper: PaletteSwapper = PaletteSwapper.getInstance();
  lastAnimationKey: string = '';

  preload() {
    this.load.image('title', 'static/title.png');
    this.load.atlas(
      'global-atlas',
      'static/global.png',
      'static/global-atlas.json'
    );
  }
  create() {
    // Add background image
    const background = this.add.image(0, 0, 'title');
    background.setOrigin(0, 0);
    background.setDisplaySize(SCREEN_WIDTH, SCREEN_HEIGHT);
    background.setDepth(-10);

    //loadWorld().then(() => {

    const loadingMessage = this.add.text(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT - 75,
      `Loading...`,
      {
        fontSize: '24px',
        color: '#000000'
      }
    );
    loadingMessage.setOrigin(0.5, 0);

    // Add customization panel
    const panelX = 40;
    const panelY = 720 / 2 - 150;
    const panelWidth = 400;
    const panelHeight = 400;

    const customizationPanel = this.add.rectangle(
      panelX + panelWidth / 2,
      panelY,
      panelWidth,
      panelHeight,
      0x000000,
      0.7
    );
    customizationPanel.setOrigin(0.5, 0);
    customizationPanel.setDepth(-1);

    // Add panel title
    const panelTitle = this.add.text(
      panelX + panelWidth / 2,
      panelY + 20,
      'Customize Your Character',
      {
        fontSize: '26px',
        color: '#ffffff'
      }
    );
    panelTitle.setOrigin(0.5, 0.5);

    // Positions within the panel
    const panelContentX = panelX + 20;
    let currentY = panelY + 80;
    const spacingY = 50;

    // Character Name
    this.add.text(panelContentX, currentY, 'Character Name', {
      fontSize: '16px',
      color: '#ffffff'
    });
    const characterName = this.add.text(
      panelContentX + 200,
      currentY,
      currentCharacter!.name,
      {
        fontSize: '20px',
        color: '#ffffff',
        backgroundColor: '#17a2b8',
        padding: { x: 15, y: 8 }
      }
    );
    characterName.setInteractive({ useHandCursor: true });
    characterName.setOrigin(0, 0.5);

    // Hover effects
    characterName.on('pointerover', () => {
      characterName.setStyle({ backgroundColor: '#138496' });
    });
    characterName.on('pointerout', () => {
      characterName.setStyle({ backgroundColor: '#17a2b8' });
    });

    characterName.on('pointerdown', () => {
      const userName = window.prompt('Please enter your name:');
      if (userName && validateName(userName)) {
        changeName(userName);
        characterName.setText(userName);
      }
    });

    // Update Y position
    currentY += spacingY;

    // Color Pickers
    const labelX = panelContentX + 200;
    const pickerX = labelX + 120;

    this.createColorPicker(
      'Eye Color',
      labelX,
      pickerX,
      currentY,
      currentCharacter!.eyeColor,
      (color) => {
        currentCharacter!.eyeColor = color;
        saveColors();
      }
    );

    currentY += spacingY;

    this.createColorPicker(
      'Belly Color',
      labelX,
      pickerX,
      currentY,
      currentCharacter!.bellyColor,
      (color) => {
        currentCharacter!.bellyColor = color;
        saveColors();
      }
    );

    currentY += spacingY;

    this.createColorPicker(
      'Fur Color',
      labelX,
      pickerX,
      currentY,
      currentCharacter!.furColor,
      (color) => {
        currentCharacter!.furColor = color;
        saveColors();
      }
    );

    this.anims.create({
      key: `test-idle`,
      frames: this.anims.generateFrameNames('global-atlas', {
        start: 1,
        end: 4,
        prefix: `player-idle-`
        //suffix: '.png'
      }),
      frameRate: 5,
      repeat: -1
    });

    // Position the character sprite
    this.playerSprite = this.add
      .sprite(panelContentX, panelY + 100, 'global-atlas')
      .setScale(6);
    this.playerSprite.setOrigin(0, 0);

    setupAbly()
      .then(() => {
        // Create 'START!' button
        loadingMessage.destroy();
        const startGame = this.add.text(
          SCREEN_WIDTH / 2,
          SCREEN_HEIGHT - 75,
          'START!',
          buttonStyle
        );
        startGame.setOrigin(0.5, 0);
        startGame.setInteractive({ useHandCursor: true });

        // Hover effects
        startGame.on('pointerover', () => {
          startGame.setStyle(nameButtonHoverStyle);
        });
        startGame.on('pointerout', () => {
          startGame.setStyle(buttonStyle);
        });

        startGame.on('pointerdown', () => {
          this.scene.start('PauseScene');
          this.scene.start('WorldScene');
          this.scene.start('UxScene');
          this.scene.start('FrameScene');
          setGameState('worldLoaded');
        });
      })
      .catch((_error) => {
        console.error('Error setting up Ably');
        // Handle Ably connection failure
      });

    //});
  }

  update() {
    if (this.playerSprite) {
      const eyeColor = currentCharacter!.eyeColor;
      const bellyColor = currentCharacter!.bellyColor;
      const furColor = currentCharacter!.furColor;
      const animationKey = `test-idle-${eyeColor}-${bellyColor}-${furColor}`;
      if (this.lastAnimationKey === animationKey) {
        return;
      }

      const furShade1Color = darkenColor(furColor, 25);
      const furShade2Color = darkenColor(furColor, 50);
      console.log('Redrawing character with animation key:', animationKey);
      this.paletteSwapper.swapAnimationPalette(
        this,
        'test-idle',
        animationKey,
        'global-atlas',
        {
          COLOR_1: eyeColor,
          COLOR_2: bellyColor,
          COLOR_3: furColor,
          COLOR_3_DARK: furShade1Color,
          COLOR_3_DARKER: furShade2Color
        }
      );
      this.playerSprite.anims.play(animationKey);
      this.lastAnimationKey = animationKey;
    }
  }

  createColorPicker(
    labelText: string,
    xLabel: number,
    xPicker: number,
    y: number,
    defaultColor: number,
    callback: (color: number) => void
  ) {
    // Create label text in Phaser
    const label = this.add.text(xLabel, y, labelText, {
      fontSize: '16px',
      color: '#ffffff'
    });
    label.setOrigin(0, 0.5); // Left-align the label text

    // Create the color input element as a DOM Element
    const colorInput = this.add.dom(xPicker, y - 10, 'input');
    colorInput.setOrigin(0, 0.5); // Left-align the color picker

    const inputElement = colorInput.node as HTMLInputElement;

    inputElement.type = 'color';
    inputElement.value = numberToHexString(defaultColor);
    inputElement.classList.add('phaser-color-input');

    // Adjust styles
    const pickerWidth = 32; // Width of the color picker input
    inputElement.style.width = `${pickerWidth}px`;
    inputElement.style.height = '32px';
    inputElement.style.border = 'none';
    inputElement.style.padding = '0';
    inputElement.style.background = 'none';

    colorInput.setDepth(9999);

    // Listen for changes to the color input
    inputElement.addEventListener('input', (event: Event) => {
      const color = (event.target as HTMLInputElement).value;

      callback(hexStringToNumber(color));
    });
  }
}
