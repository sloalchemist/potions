import { worldTimer } from './services/setup';
import { startCli } from '../cli/index';

setInterval(worldTimer, 500);

// start listening for CLI commands
startCli();
