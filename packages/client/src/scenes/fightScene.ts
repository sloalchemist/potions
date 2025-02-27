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
    player.setDepth(1);

    background.setScrollFactor(0); // Prevent image from moving when scenes scroll

    const enemyName = this.add.text(60, 120, 'Blob', {
      font: '16px Arial',
      color: '#000000'
    });
    enemyName.setDepth(2)

    const enemyHealthBar = this.add.graphics();
    enemyHealthBar.fillStyle(0x008000, 1);
    enemyHealthBar.fillRect(
      100,
      140,
      this.game.scale.width * 0.3,
      this.game.scale.height * -0.03
    );
    enemyHealthBar.setDepth(1);

    const enemyHealthBackGround = this.add.graphics();
    enemyHealthBackGround.fillStyle(0xD3D3D3, 1);
    enemyHealthBackGround.fillRect(
      50,
      140,
      this.game.scale.width * 0.43,
      this.game.scale.height * -0.04
    );
    enemyHealthBackGround.setDepth(0);

    const playerName = this.add.text(193, 220, 'Player', {
      font: '16px Arial',
      color: '#000000'
    });
    playerName.setDepth(2);

    const playerHealthBar = this.add.graphics();
    playerHealthBar.fillStyle(0x008000, 1);
    playerHealthBar.fillRect(
      240,
      240,
      this.game.scale.width * 0.3,
      this.game.scale.height * -0.03
    );
    playerHealthBar.setDepth(1);

    const playerHealthBackGround = this.add.graphics();
    playerHealthBackGround.fillStyle(0xD3D3D3, 1);
    playerHealthBackGround.fillRect(
      190,
      240,
      this.game.scale.width * 0.43,
      this.game.scale.height * -0.04
    );
    playerHealthBackGround.setDepth(0);

    const playerShadow = this.add.graphics();
    playerShadow.fillStyle(0x828C82, 1);
    playerShadow.fillCircle(
      SCREEN_WIDTH / 2 + 100,
      350,
      this.game.scale.width * 0.105,
    )
    playerShadow.setDepth(0);

    const xPos = this.game.scale.width/2 - 100;
    const yPos = this.game.scale.height - 170;

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
