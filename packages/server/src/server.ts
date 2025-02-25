import { worldTimer } from './services/setup';
import { initializeCli } from '../cli/cheatHandler';
import { DataPusher } from './grafana/dataLogger';

setInterval(worldTimer, 500);
setInterval(DataPusher.pusherTimer, 10000);

// start listening for CLI commands
initializeCli();
