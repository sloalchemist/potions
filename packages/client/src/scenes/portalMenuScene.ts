import { SCREEN_HEIGHT, SCREEN_WIDTH } from '../config';
import { buttonStyle, nameButtonHoverStyle } from './loadWorldScene';
import { availableWorlds } from '../world/controller';
import { getWorldID } from '../worldMetadata';
import { updateWorld } from '../services/playerToServer';

const MAINTAIN_WORLD_OPTION = 'NO_CHANGE';

export class PortalMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PortalMenuScene' });
  }

  world_map = new Map<string, number>([
    ['fire-world', 3],
    ['water-world', 4],
    ['test-world', 5]
  ]);

  changeWorld(world_id: string) {
    updateWorld(world_id);
    sessionStorage.setItem('traveling_through_portal', 'true');
    sessionStorage.setItem('traveling_to', world_id);
    window.location.reload();
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
    let count = 0;
    // Add world selection buttons
    availableWorlds.forEach((world) => {
      if (worldName == world.name) {
        return;
      }

      // If world uptime ID in world_map is incorrect, do not create button
      const uptimeWorldID = this.world_map.get(world.name);
      if (!uptimeWorldID) {
        console.log(`${world.name} uptime ID does not match that in world_map`);
        return;
      }
      console.log(uptimeWorldID, 'is uptimeworldid');
      console.log(world.name, 'is world name');
      // If world server is down, do not create button for the server
      this.fetchData(uptimeWorldID).then((status) => {
        if (status === 'Downer') {
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
          console.log(`Selected world: ${world.name} with id ${world.id}`);
          this.changeWorld(world.name);
          this.scene.stop('PortalMenuScene');
        });
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
      this.changeWorld(MAINTAIN_WORLD_OPTION);
    });
  }

  // Uses uptime API to find out status of servers
  async fetchData(uptimeID: number): Promise<string> {
    const response = await fetch(
      `https://status.vosburg.us/api/badge/${uptimeID}/status`
    );

    if (!response.ok) {
      throw new Error(`HTTP Error requesting uptime data ${response.status}`);
    }

    const svg = await response.text();

    // Only xml available, must parse text for "Status Down" message
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svg, 'image/svg+xml');
    const textNodes = svgDoc.querySelectorAll('text');

    for (const node of Array.from(textNodes)) {
      const text = node.textContent?.trim();
      if (text === 'Up' || text === 'Down') {
        console.log(`Status found: ${text}`);
        return text;
      }
    }

    return 'Down';
  }
}
