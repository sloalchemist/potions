import { MessageStack } from '../components/messageStack';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';

export class BrewScene extends Phaser.Scene {
  private messageStack!: MessageStack;
  private brewColor = 0xffffff;

  constructor() {
    super({ key: 'BrewScene' });
  }

  preload() {
    this.load.image('brewImage', 'static/potion-brewing.png');
  }

  create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(this.brewColor, 1);
    graphics.fillRect(
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
