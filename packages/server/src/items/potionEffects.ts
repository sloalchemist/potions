import { Mob } from '../mobs/mob';
import { hexStringToNumber, numberToHexString } from '../util/colorUtil';
import { FantasyDate } from '../../src/date/fantasyDate';
import { scheduler } from 'timers/promises';


export function drinkPotion(mob: Mob, potionType: string): boolean {
  console.log('Drink potion', potionType);
  if (potionType === String(hexStringToNumber('#FF0000'))) {
    mob.changeHealth(50);
    return true;
  }

  else if (potionType === String(hexStringToNumber('#0000FF'))) {

    const speedDelta = 2; 
    const speedDuration = 10;

    // Change speed by calling mob.changeSpeed with delta and duration
    mob.changeSpeed(speedDelta, speedDuration);

    // Start checking for speed reset periodically
    const resetInterval = setInterval(() => {
      if (mob.checkSpeedReset(speedDelta)) {
        clearInterval(resetInterval);  // Stop checking once the speed is reset
        console.log("Speed reset successfully!");
      }
    }, 5000);

    return true;
  }

  console.log("ERROR: Unknown potion type!");
  return false;
}