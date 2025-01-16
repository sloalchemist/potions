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
    // get current tick, add x amount of time, check when global tick hits that number, change speed
    let curr_date = FantasyDate.currentDate();
    const target_tick = curr_date.global_tick + 10;
    console.log("target tick:" + target_tick.toString());

    console.log("initial tick:")
    console.log(curr_date.global_tick);

    mob.changeSpeed(2);
    // if (curr_date.global_tick === target_tick)
    // {
    //   mob.changeSpeed(-2);
    //   console.log("after tick:")
    //   console.log(curr_date.global_tick);
    // }
    
    return true;
  }

  console.log("ERROR: Unknown potion type!");
  return false;
}