import Ably from 'ably';
import 'dotenv/config';
import { getEnv } from '@rt-potion/common';

export const apiKey = getEnv('ABLY_API_KEY');
console.log('Ably API Key:', apiKey);

let ably: Ably.Realtime;
try {
  ably = new Ably.Realtime({ key: apiKey });
  console.log('Ably client initialized successfully.');
} catch (error) {
  console.error('Error initializing Ably client:', (error as Error).message);
  process.exit(1);
}

export { ably };
