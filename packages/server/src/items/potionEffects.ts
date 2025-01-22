import { Mob } from '../mobs/mob';
import { hexStringToNumber } from '../util/colorUtil';

export function drinkPotion(mob: Mob, potionType: string): boolean {
  if (potionType === String(hexStringToNumber('#FF0000'))) {
    mob.changeHealth(50);
    return true;
  }

  else if (potionType === String(hexStringToNumber('#0000FF'))) {

    const speedDelta = 2; 
    const speedDuration = 30;

    // Change speed by calling mob.changeSpeed with delta and duration
    mob.changeSpeed(speedDelta, speedDuration);

    return true;
  }
  
  return false;
}