const DEPTH_BASE = 100;

export const miniButtonStyle = {
  fontSize: '12px',
  color: '#ffffff',
  backgroundColor: '#808080', // Green background
  padding: {
    x: 7.5,
    y: 2.5
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
    this.background = this.add.rectangle(18, 15, 220, 35, 0x000000, 0.7);
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

    // Create Button For Opening
    const openButton = this.add.text(
      this.background.x + this.background.width - 35,
      this.background.y + 18,
      'Show',
      miniButtonStyle
    );

    // Set Button Interactivity
    openButton.setInteractive({ useHandCursor: true });
    openButton.setOrigin(0.5);
    openButton.setDepth(DEPTH_BASE + 2);

    // Click Handler
    openButton.on('pointerdown', () => {
      console.log(`Now Showing Leaderboard`);

      // Stop showing mini leaderboard
      this.scene.stop('MiniLeaderboardScene');

      // Start showing full leaderboard
      this.scene.start('LeaderboardScene');
    });
  }
}
