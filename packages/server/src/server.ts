import { worldTimer } from './services/setup';
import { initializeCli } from '../cli/cheatHandler';

setInterval(worldTimer, 500);

// start listening for CLI commands
initializeCli();
