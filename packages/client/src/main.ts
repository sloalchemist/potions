import * as Phaser from 'phaser';
import config from './config';
import { gameState, setGameState } from './world/controller';
import { playerDead } from './services/serverToBroadcast';

const game = new Phaser.Game(config);

export let focused = true;

game.events.on('blur', () => {
  console.log('Game lost focus');
  // prevent blur from happening if the game over is reached
  if (playerDead) {
    return;
  }

  if (gameState === 'stateInitialized') {
    game.scene.stop('WorldScene');
    setGameState('worldLoaded');
  }

  focused = false;
});

game.events.on('focus', () => {
  console.log('Game gained focus');
  focused = true;

  if (gameState === 'worldLoaded') {
    game.scene.start('WorldScene');
  }
});
