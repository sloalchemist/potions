import 'dotenv/config';
import { getEnv } from '@rt-potion/common';
import { logger } from '../util/logger';

function requestServer(URL: string) {
  fetch(URL)
    .then(() => {
      //counter++;
    })
    .catch((e) => {
      logger.log(e, 'Request Failed');
    });
}

export function requestClock() {
  let server_url: string;
  let uptime_msg: string;

  try {
    server_url = getEnv('SERVER_URL');
    uptime_msg = getEnv('UPTIME_MSG');
  } catch {
    logger.log('SERVER_ENV and UPTIME_MSG not set disabling request clock');
    return;
  }
  const URL = `${server_url}${uptime_msg}`;
  setInterval(() => requestServer(URL), 300);
}
