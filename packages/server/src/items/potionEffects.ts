import { Mob } from '../mobs/mob';
import { numberToHexString } from '../util/colorUtil';
import { logger } from '../util/Logger';

export function drinkPotion(mob: Mob, potionType: string): boolean {
  const potionStr = numberToHexString(Number(potionType));

  logger.log('Drinking potion of type:', potionStr);

  switch (potionStr) {
    case '#ff0000':
      logger.log('Drinking red potion');
      mob.changeHealth(50);
      return true;
    case '#0000ff':
      logger.log('Drinking blue potion');
      logger.log(mob._speed);
      const speedDelta = mob._speed * 0.5;
      const speedDuration = 30;
      mob.changeEffect(speedDelta, speedDuration, 'speed');
      return true;
    case '#e79600':
      logger.log('Drinking orange potion');
      const attackDelta = mob._attack * 0.5;
      const attackDuration = 240;
      mob.changeEffect(attackDelta, attackDuration, 'attack');
      return true;
    case '#ef7d55':
      logger.log('Drinking gold potion');
      mob.changeMaxHealth(20, true);
      return true;
    case '#8b7f6e':
      logger.log('Drinking grey potion');
      mob.changeSlowEnemy(1);
      return true;
    case '#ab00e7':
      logger.log('Drinking purple potion');
      const defenseDelta = mob._defense * 0.5;
      const defenseDuration = 240;
      mob.changeEffect(defenseDelta, defenseDuration, 'defense');
      return true;
    default:
      // handle cases where potionStr doesn't match any known potion
      logger.log('Unknown potion color');
      return false;
  }
}
