import { Mob } from '../mobs/mob';

export function applyCheat(player: Mob, cheat_code: string) {
  if (cheat_code === 'speed') {
    player.changeSpeed(2, 30);
  } else if (cheat_code === 'health') {
    player.changeHealth(100);
  }
}
