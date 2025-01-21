import { Mob } from '../mobs/mob';
import { hexStringToNumber } from '../util/colorUtil';

export function drinkPotion(mob: Mob, potionType: string): boolean {
  console.log('Drink potion', potionType);
  if (potionType === String(hexStringToNumber('#FF0000'))) {
    mob.changeHealth(50);
    return true;
  }

  else if (potionType === String(hexStringToNumber('#0000FF'))) {

    const speedDelta = 2; 
    const speedDuration = 30;

    // Change speed by calling mob.changeSpeed with delta and duration
    mob.changeSpeed(speedDelta, speedDuration);

    // Start checking for speed reset periodically
    const resetInterval = setInterval(() => {
      if (mob.checkSpeedReset(speedDelta)) {
        clearInterval(resetInterval);  // Stop checking once the speed is reset
      }
    }, 500);

    resetInterval.unref(); // allows teardown if last active handler

    return true;
  }
  
  return false;
}