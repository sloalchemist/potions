import { leaderboardData } from '../world/controller';
import { miniButtonStyle } from './miniLeaderboardScene';

const DEPTH_BASE = 100;
const MAX_ROWS = 3;
const MAX_USERNAME_LENGTH = 10;

export class LeaderboardScene extends Phaser.Scene {
  private leaderboardTexts: Phaser.GameObjects.Text[] = [];
  private background?: Phaser.GameObjects.Rectangle;
  private titleText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaderboardScene' });
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

    // Create Button For Closing
    const closeButton = this.add.text(
      this.background.x + this.background.width - 35, 
      this.background.y + 18, 
      'Hide',
      miniButtonStyle
    );

    // Set Button Interactivity
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.setOrigin(0.5);
    closeButton.setDepth(DEPTH_BASE + 2);

    // Click Handler
    closeButton.on('pointerdown', () => {
        console.log(`Now Showing Leaderboard`);

        // Stop showing full leaderboard
        this.scene.stop('LeaderboardScene');

        // Start showing mini leaderboard
        this.scene.start('MiniLeaderboardScene');
    });

    this.renderLeaderboard();
  }

  renderLeaderboard() {
    const { titleText, background } = this;

    if (!titleText) {
      throw new Error('Title text is not initialized');
    }

    if (!background) {
      throw new Error('Background is not initialized');
    }

    // Clear any existing leaderboard texts
    this.leaderboardTexts.forEach((text) => text.destroy());
    this.leaderboardTexts = [];

    const startY = titleText.y + 30;
    const lineHeight = 25;

    // Show "no gold acquired" message if leaderboard is empty
    if (leaderboardData.length === 0) {
      const text = this.add.text(
        background.x + 10,
        startY,
        'No Gold Acquired',
        {
          fontSize: '14px',
          color: '#ffffff'
        }
      );
      text.setDepth(DEPTH_BASE + 1);
      this.leaderboardTexts.push(text); // Add to leaderboardTexts
      return;
    }

    // Take only the top MAX_ROWS if there are too many
    const visibleRows = leaderboardData.slice(0, MAX_ROWS);

    // Render each user and gold amount
    visibleRows.forEach((row, index) => {
      const [username, amount] = row;
      const rank = index + 1;

      // If username too long, truncate it with ellipsis
      const truncatedUsername =
        username.length > MAX_USERNAME_LENGTH
          ? username.slice(0, MAX_USERNAME_LENGTH - 3) + '...'
          : username;

      const text = this.add.text(
        background.x + 10,
        startY + index * lineHeight,
        `${rank}. ${truncatedUsername}`,
        {
          fontSize: '14px',
          color: '#ffffff'
        }
      );
      text.setDepth(DEPTH_BASE + 1);

      // Create the amount text (right-aligned)
      const amountText = this.add.text(
        background.x + background.width - 10,
        startY + index * lineHeight,
        `${amount} gold`,
        {
          fontSize: '14px',
          color: '#efbf04'
        }
      );
      amountText.setOrigin(1, 0);
      amountText.setDepth(DEPTH_BASE + 1);

      this.leaderboardTexts.push(text);
      this.leaderboardTexts.push(amountText);
    });

    // Update background height based on visible rows
    const contentHeight =
      startY - background.y + visibleRows.length * lineHeight + 10;
    background.height = Math.max(contentHeight, 70);
  }
}
