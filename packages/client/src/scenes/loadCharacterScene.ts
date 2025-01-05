import { currentCharacter, retrieveCharacter } from '../worldMetadata';

export class LoadCharacterScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LoadCharacterScene' });
  }

  preload() {}

  create() {
    this.add.text(100, 100, 'Loading...');

    retrieveCharacter().then(() => {
      console.log('character retrieved', currentCharacter);
      this.scene.start('LoadWorldScene');
    });
  }
}
