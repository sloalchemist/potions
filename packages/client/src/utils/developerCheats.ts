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

export function persistWorldData(): void {
  console.log('Attempting to save world data in Supabase');
  publishPlayerMessage('cheat', { action: 'save' });
}
