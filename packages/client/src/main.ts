import * as Phaser from 'phaser';
import config from './config';
import { gameState, setGameState } from './world/controller';

const game = new Phaser.Game(config);

game.events.on('blur', () => {
  console.log('Game lost focus');
  if (gameState === 'stateInitialized') {
    game.scene.stop('WorldScene');
    setGameState('worldLoaded');
  }
});

game.events.on('focus', () => {
  console.log('Game gained focus');

  if (gameState === 'worldLoaded') {
    game.scene.start('WorldScene');
  }
});
