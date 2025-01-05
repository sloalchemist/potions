import Ably from 'ably';
import 'dotenv/config';

if (!process.env.ABLY_API_KEY) {
  throw new Error('Cannot run without an API key. Add your key to .env');
}

export const apiKey = process.env.ABLY_API_KEY;
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
