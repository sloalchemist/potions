import { leaderboardData } from '../world/controller';

const DEPTH_BASE = 100;
const MAX_ROWS = 3;

export class LeaderboardScene extends Phaser.Scene {
  private leaderboardTexts: Phaser.GameObjects.Text[] = [];
  private background?: Phaser.GameObjects.Rectangle;
  private titleText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'LeaderboardScene' });
  }

  create() {
    // Create a background for the leaderboard
    this.background = this.add.rectangle(18, 15, 220, 100, 0x000000, 0.7);
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

    // Create new leaderboard users and gold amounts
    const startY = titleText.y + 30;
    const lineHeight = 25;

    // Take only the top MAX_ROWS if there are too many
    const visibleRows = leaderboardData.slice(0, MAX_ROWS);

    // Render each user and gold amount
    visibleRows.forEach((row, index) => {
      const [username, amount] = row;
      const rank = index + 1;

      // Create the rank and name text
      const text = this.add.text(
        background.x + 15,
        startY + index * lineHeight,
        `${rank}. ${username}`,
        {
          fontSize: '16px',
          color: '#ffffff'
        }
      );
      text.setDepth(DEPTH_BASE + 1);

      // Create the amount text (right-aligned)
      const amountText = this.add.text(
        background.x + background.width - 15,
        startY + index * lineHeight,
        `${amount} gold`,
        {
          fontSize: '16px',
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
