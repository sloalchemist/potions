import { Mob } from '../mobs/mob';
import { hexStringToNumber } from '../util/colorUtil';

export function drinkPotion(mob: Mob, potionType: string): boolean {
  if (potionType === String(hexStringToNumber('#FF0000'))) {
    mob.changeHealth(50);
    return true;
  }

  mob.changeSpeed(2);
  return false;
}
