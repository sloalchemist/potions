import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';
import { buttonStyle, nameButtonHoverStyle } from './loadWorldScene';
import { availableWorlds } from '../world/controller';

export class PortalMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PortalMenuScene' });
  }

  create() {
    // Add semi-transparent black background
    const overlay = this.add.rectangle(
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      0x000000,
      0.7
    );
    overlay.setOrigin(0, 0);

    // Add title
    const title = this.add.text(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT / 4,
      'Select World',
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    );
    title.setOrigin(0.5);

    // Add world selection buttons
    availableWorlds.forEach((world, index) => {
      const button = this.add.text(
        SCREEN_WIDTH / 2,
        SCREEN_HEIGHT / 3 + index * 60,
        world.name,
        buttonStyle
      );
      button.setInteractive({ useHandCursor: true });
      button.setOrigin(0.5);

      // Hover effects
      button.on('pointerover', () => {
        button.setStyle(nameButtonHoverStyle);
      });
      button.on('pointerout', () => {
        button.setStyle(buttonStyle);
      });

      // Click handler
      button.on('pointerdown', () => {
        // TODO: Implement world transition
        console.log(`Selected world: ${world.name} with id ${world.id}`);
        this.scene.stop('PortalMenuScene');
      });
    });

    // Add close button
    const closeButton = this.add.text(
      SCREEN_WIDTH / 2,
      SCREEN_HEIGHT * 0.7,
      'Close',
      buttonStyle
    );
    closeButton.setInteractive({ useHandCursor: true });
    closeButton.setOrigin(0.5);

    // Hover effects
    closeButton.on('pointerover', () => {
      closeButton.setStyle(nameButtonHoverStyle);
    });
    closeButton.on('pointerout', () => {
      closeButton.setStyle(buttonStyle);
    });

    // Close button action
    closeButton.on('pointerdown', () => {
      this.scene.stop('PortalMenuScene');
    });
  }
}
