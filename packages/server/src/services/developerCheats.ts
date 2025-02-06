import { Mob } from '../mobs/mob';

export function applyCheat(player: Mob, cheat_code: string) {
  if (cheat_code === 'speed') {
    player.changeEffect(2, 30, 'speed');
  } else if (cheat_code === 'health') {
    player.changeHealth(100);
  }
}
