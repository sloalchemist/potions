import { MessageStack } from '../components/messageStack';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';

export class BrewScene extends Phaser.Scene {
  private messageStack!: MessageStack;
  private brewColor = 0x222222;
  private numIngredients = 2;

  constructor() {
    super({ key: 'BrewScene' });
  }

  preload() {
    this.load.image('brewImage', 'static/potion-brewing.png');
  }

  create() {
    const barBackground = this.add.graphics();
    barBackground.fillStyle(0x222222, 1);
    barBackground.fillRect(
      180,
      290,
      this.game.scale.width * 0.4,
      this.game.scale.height * -0.3
    );

    const barBackgroundColored = this.add.graphics();
    barBackgroundColored.fillStyle(0xff0000, 1);
    barBackgroundColored.fillRect(
      180,
      290,
      this.game.scale.width * 0.4,
      this.game.scale.height * -0.115 * this.numIngredients
    );

    const circleBackground = this.add.graphics();
    circleBackground.fillStyle(this.brewColor, 1);
    circleBackground.fillRect(
      90,
      90,
      this.game.scale.width * 0.4,
      this.game.scale.height * 0.3
    );

    const overlayImage = this.add.image(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2,
      'brewImage'
    ); // Adjust x, y and texture as needed
    overlayImage.setScrollFactor(0); // Prevent image from moving when scenes scroll
    console.log('BrewScene created');

    this.messageStack = new MessageStack(this);
  }

  setBrewColor(color: number) {
    this.brewColor = color;
  }
}
