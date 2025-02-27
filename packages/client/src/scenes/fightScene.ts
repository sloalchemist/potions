import { MessageStack } from '../components/messageStack';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';
import { Button } from '../components/button';

export class FightScene extends Phaser.Scene {
  private messageStack!: MessageStack; 

  constructor() {
    super({ key: 'FightScene' });
  }

  preload() {
    this.load.image('fightScreenImage', 'static/fightScreen.png');
    this.load.image('enemySlime', 'static/enemy-slime.png');
    this.load.image('player', 'static/player.png');
  }

  create() {
    // Add the fight screen image 
    const background = this.add.image(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 2,
      'fightScreenImage'
    ); // Adjust x, y and texture as needed

    const enemy = this.add.image(100, 200, 'enemySlime');

    const player = this.add.image(SCREEN_WIDTH / 2 + 100, 330, 'player');

    background.setScrollFactor(0); // Prevent image from moving when scenes scroll

    const barBackground = this.add.graphics();
    barBackground.fillStyle(0x008000, 1);
    barBackground.fillRect(
      70,
      150,
      this.game.scale.width * 0.3,
      this.game.scale.height * -0.03
    );

    const xPos = this.game.scale.width/2 - 100;
    const yPos = this.game.scale.height - 130;

    const fightButton = new Button(this, xPos, yPos, true, 'Attack', () => {
      console.log('Attack button clicked');
    });

    const potionButton = new Button(this, xPos + 200, yPos, true, 'Use Potion', () => {
      console.log('Potion button clicked');
    });

    const hugButton = new Button(this, xPos, yPos + 80, true, 'Hug', () => {
      console.log('Hug button clicked');
    });

    const runButton = new Button(this, xPos + 200, yPos + 80, true, 'Run', () => {
      console.log('Run button clicked');
      this.scene.stop('FightScene');
    });

    console.log('FightScene created');


    this.messageStack = new MessageStack(this);
  }

}
