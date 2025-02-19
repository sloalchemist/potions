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
      console.log(mob._speed);
      const speedDelta = mob._speed * 0.5;
      const speedDuration = 30;
      mob.changeEffect(speedDelta, speedDuration, 'speed');
      return true;
    case '#ffa500':
      console.log('Drinking orange potion');
      const attackDelta = mob._attack * 0.5;
      const attackDuration = 240;
      mob.changeEffect(attackDelta, attackDuration, 'attack');
      return true;
    case '#ffd700':
      console.log('Drinking gold potion');
      mob.changeMaxHealth(20, true);
      return true;
    case '#8b7f6e':
      console.log('Drinking grey potion');
      mob.changeSlowEnemy(1);
      return true;
    default:
      // handle cases where potionStr doesn't match any known potion
      console.log('Unknown potion color');
      return false;
  }
}
