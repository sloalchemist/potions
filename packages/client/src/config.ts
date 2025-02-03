import * as Phaser from 'phaser';
import { WorldScene } from './scenes/worldScene';
import { UxScene } from './scenes/uxScene';
import { LoadWorldScene } from './scenes/loadWorldScene';
import { LoadCharacterScene } from './scenes/loadCharacterScene';
import { FrameScene } from './scenes/frameScene';
import { PauseScene } from './scenes/pauseScene';
import {BrewScene} from './scenes/brewScene';

export const SCREEN_WIDTH = 480;
export const SCREEN_HEIGHT = 720;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
  parent: 'game-container',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
  },
  backgroundColor: '#ffffff',
  roundPixels: true,
  dom: {
    createContainer: true
  },
  scene: [
    LoadCharacterScene,
    LoadWorldScene,
    PauseScene,
    WorldScene,
    UxScene,
    FrameScene,
    BrewScene
  ]
};

export default config;
