import { Mob } from '../mobs/mob';
import { numberToHexString } from '../util/colorUtil';

export function drinkPotion(mob: Mob, potionType: string): boolean {
  console.log(
    'Drinking potion of type:',
    numberToHexString(Number(potionType))
  );
  if (numberToHexString(Number(potionType)) === '#ff0000') {
    console.log('Drinking red potion');
    mob.changeHealth(50);
    return true;
  } else if (numberToHexString(Number(potionType)) === '#0000ff') {
    console.log('Drinking blue potion');
    const speedDelta = 2;
    const speedDuration = 30;

    // Change speed by calling mob.changeSpeed with delta and duration
    mob.changeSpeed(speedDelta, speedDuration);

    return true;
  }

  return false;
}
