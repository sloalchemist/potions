import { worldTimer } from './services/setup';
import { initializeCli } from '../cli/cheatHandler';
import { pushMetrics } from './grafana/dataLogger';
import { requestClock } from './grafana/request';

setInterval(worldTimer, 500);
pushMetrics();
requestClock();

// start listening for CLI commands
initializeCli();
