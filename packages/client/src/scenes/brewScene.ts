import { MessageStack } from '../components/messageStack';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';

export class BrewScene extends Phaser.Scene {
  private messageStack!: MessageStack;

  constructor() {
    super({ key: 'BrewScene' });
  }

  preload() {
    this.load.image('overlayImage', 'static/potion-brewing.png');
  }

  create() {
    const overlayImage = this.add.image(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2,
      'overlayImage'
    ); // Adjust x, y and texture as needed
    overlayImage.setScrollFactor(0); // Prevent image from moving when scenes scroll
    console.log('BrewScene created');

    this.messageStack = new MessageStack(this);
  }
}
