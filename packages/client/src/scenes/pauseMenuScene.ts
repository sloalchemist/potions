import { setGameState } from '../world/controller';

export const GRAY = 0x2f4f4f;

export class PauseMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseMenuScene' });
  }

  preload() {}

  create() {
    this.scene.stop('MiniLeaderboardScene');
    const graphics = this.add.graphics();
    graphics.fillStyle(GRAY, 1);
    graphics.fillRect(
      10,
      10,
      this.game.scale.width - 20,
      this.game.scale.height * 0.5 - 10
    );

    const resumeButton = this.add.text(
      this.game.scale.width / 2,
      this.game.scale.height / 4,
      'Resume Game',
      { font: '32px Arial', color: '#fff' }
    );
    resumeButton.setOrigin(0.5);
    resumeButton.setInteractive();
    resumeButton.on('pointerdown', () => {
      this.scene.resume('WorldScene');
      this.scene.resume('MiniLeaderboardScene');
      this.scene.stop('PauseMenuScene');
    });

    const mainMenuButton = this.add.text(
      this.game.scale.width / 2,
      this.game.scale.height / 4 + 50,
      'Main Menu',
      { font: '32px Arial', color: '#fff' }
    );
    mainMenuButton.setOrigin(0.5);
    mainMenuButton.setInteractive();
    mainMenuButton.on('pointerdown', () => {
      this.sound.removeByKey('walk');
      this.sound.removeByKey('background_music');
      this.sound.removeByKey('background_music_layer');

      setGameState('uninitialized');
      const allScenes = this.scene.manager.getScenes();
      allScenes.forEach((scene) => {
        const key = scene.sys.settings.key;
        this.scene.stop(key);
      });
      this.scene.start('LoadCharacterScene', { autoStart: true });
    });
  }
}

// 1. Hide leaderboard
// 2. Button to go to main menu.
// 2b. Button to go back to game (get rid of screen)
// 3. Listen on escape key
