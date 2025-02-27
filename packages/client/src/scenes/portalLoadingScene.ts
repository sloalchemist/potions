import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';

export class PortalLoadingScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PortalLoadingScene' });
  }

  create() {
    // Add semi-transparent black background
    const overlay = this.add.rectangle(
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT / 2,
      0x000000,
      0.7
    );
    overlay.setOrigin(0, 0);

    // Add loading text
    const loadingText = this.add.text(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 4,
      'Loading World...',
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    );
    loadingText.setOrigin(0.5);
  }
}
