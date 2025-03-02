import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';

const DEPTH_BASE = 100;

export const miniButtonStyle = {
    fontSize: '24px',
    color: '#ffffff',
    backgroundColor: '#28a745', // Green background
    padding: {
      x: 20,
      y: 10
    },
    align: 'center'
  };

export class MiniLeaderboardScene extends Phaser.Scene {
  private background?: Phaser.GameObjects.Rectangle;
  private titleText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'MiniLeaderboardScene' });
  }

  create() {
    // Create a background for the leaderboard
    this.background = this.add.rectangle(18, 15, 220, 70, 0x000000, 0.7);
    this.background.setOrigin(0, 0);
    this.background.setDepth(DEPTH_BASE);

    // Add title
    this.titleText = this.add.text(
      this.background.x + 10,
      this.background.y + 10,
      'Leaderboard',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    );
    this.titleText.setDepth(DEPTH_BASE + 1);

    const closeButton = this.add.text(
          SCREEN_WIDTH / 2,
          SCREEN_HEIGHT * 0.7,
          'Open',
          miniButtonStyle
        );

    // Click Handler
    closeButton.on('pointerdown', () => {

        console.log(`Now Showing Leaderboard`);
        
        // Stop showing mini leaderboard
        this.scene.stop('leaderboardMiniScene');
        
        // Start showing full leaderboard
        this.scene.start('leaderboardScene');
    
    });
  }
}
