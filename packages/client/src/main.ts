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

// NodeModule type does not implicitly have a hot property
// So we need to cast it to any and disable the eslint rule
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mod = module as any;
if (mod.hot) {
  // Accept new changes
  mod.hot.accept();
  // Reload on changes to prevent stale state
  mod.hot.dispose(() => window.location.reload());
}
