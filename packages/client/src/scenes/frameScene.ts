import { MessageStack } from '../components/messageStack';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';

export class FrameScene extends Phaser.Scene {
  private messageStack!: MessageStack;

  constructor() {
    super({ key: 'FrameScene' });
  }

  preload() {
    this.load.image('overlayImage', 'static/frame.png');
  }

  create() {
    console.log("creating frame");
    const overlayImage = this.add.image(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2,
      'overlayImage'
    ); // Adjust x, y and texture as needed
    overlayImage.setScrollFactor(0); // Prevent image from moving when scenes scroll
    //overlayImage.setScale(1.4814);
    console.log('FrameScene created');

    this.messageStack = new MessageStack(this);
    // Add a sample message
    //this.messageStack.addMessage("Task completed!", 120); // 2 minutes
    //this.messageStack.addMessage("Starting soon...", 30); // 30 seconds
  }
}
