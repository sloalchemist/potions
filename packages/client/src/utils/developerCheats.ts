import { publishPlayerMessage } from '../services/playerToServer';

export function speedUpCharacter(): void {
  console.log('Speeding up!');
  // Broadcast PlayerToServer message here
  publishPlayerMessage('cheat', { action: 'speed' });
}

export function restoreHealth(): void {
  console.log('Health restored!!');
  // Broadcast PlayerToServer message here
  publishPlayerMessage('cheat', { action: 'health' });
}
