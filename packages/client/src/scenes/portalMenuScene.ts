import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';
import { buttonStyle, nameButtonHoverStyle } from './loadWorldScene';
import { availableWorlds } from '../world/controller';
import { getWorldID } from '../worldMetadata';

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

    // Add a full-screen invisible blocker
    const blocker = this.add.rectangle(
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      0x000000,
      0
    );
    blocker.setOrigin(0, 0);
    blocker.setInteractive(); // This makes it catch pointer events
    blocker.setDepth(overlay.depth); // Ensure it's above the game but below UI elements

    // Stop pointer events from propagating to the game scene
    blocker.on('pointerdown', () => {
      console.log('Prevent click from reaching menu tabs.');
    });

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
      const worldName = getWorldID();
      var count = 0;
    // Add world selection buttons
      availableWorlds.forEach((world) => {
          if (worldName == world.name) {
              return;
        }
          const button = this.add.text(
              SCREEN_WIDTH / 2,
              SCREEN_HEIGHT / 3 + count * 60,
              world.name,
              buttonStyle
      );
      count += 1;
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
