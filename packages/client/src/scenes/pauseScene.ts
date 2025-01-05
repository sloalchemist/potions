export const GRAY = 0x2f4f4f;

export class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene' });
  }

  preload() {}

  create() {
    const graphics = this.add.graphics();
    graphics.fillStyle(GRAY, 1);
    graphics.fillRect(
      10,
      10,
      this.game.scale.width - 20,
      this.game.scale.height * 0.5 - 10
    );
  }
}
