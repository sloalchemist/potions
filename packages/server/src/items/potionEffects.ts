import { Mob } from '../mobs/mob';
import { numberToHexString } from '../util/colorUtil';

export function drinkPotion(mob: Mob, potionType: string): boolean {
  const potionStr = numberToHexString(Number(potionType));

  console.log('Drinking potion of type:', potionStr);

  switch (potionStr) {
    case '#ff0000':
      console.log('Drinking red potion');
      mob.changeHealth(50);
      return true;
    case '#0000ff':
      console.log('Drinking blue potion');
      const speedDelta = mob._speed * 0.5;
      const speedDuration = 600;
      mob.changeEffect(speedDelta, speedDuration, 'speed');
      return true;
    default:
      // Handle cases where potionStr doesn't match any known potion
      console.log('Unknown potion color');
      return false;
  }
}
