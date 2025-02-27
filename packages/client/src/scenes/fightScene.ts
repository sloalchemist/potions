import { MessageStack } from '../components/messageStack';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';

export class FightScene extends Phaser.Scene {
  private messageStack!: MessageStack; 

  constructor() {
    super({ key: 'FightScene' });
  }

  preload() {
    this.load.image('fightScreenImage', 'static/fightScreen.png');
  }

  create() {
    // Add the fight screen image 
    const background = this.add.image(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2,
      'fightScreenImage'
    ); // Adjust x, y and texture as needed
    background.setScrollFactor(0); // Prevent image from moving when scenes scroll
    console.log('FightScene created');

    this.messageStack = new MessageStack(this);
  }

}
