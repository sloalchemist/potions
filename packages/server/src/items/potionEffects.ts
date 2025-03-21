import { Mob } from '../mobs/mob';
import { pubSub } from '../services/clientCommunication/pubsub';
import {
  numberToHexString,
  hexToRgb,
  perceptualColorDistance,
  hexStringToNumber
} from '../util/colorUtil';
import { Item } from './item';
import { Smashable } from './smashable';
import { logger } from '../util/logger';

interface ColorDict {
  [key: string]: string;
}

const colordict: ColorDict = {
  '#ff0000': 'red',
  '#0000ff': 'blue',
  '#e79600': 'orange',
  '#ef7d55': 'gold',
  '#ab00e7': 'purple',
  '#00ff00': 'green',
  '#166060': 'black'
};

export function drinkPotion(
  mob: Mob,
  potionType: string,
  effectModifier?: number
): boolean {
  const potionStr = numberToHexString(Number(potionType));

  switch (potionStr) {
    case '#ff0000':
      logger.log('Drinking red potion');
      let healthValue = 50;
      if (effectModifier) healthValue = healthValue * effectModifier;
      mob.changeHealth(healthValue);
      return true;
    case '#0000ff':
      logger.log('Drinking blue potion');
      logger.log('Mob Speed:', mob._speed);
      let speedMultiplier = 0.5;
      let speedDuration = 240;
      if (effectModifier) {
        speedMultiplier = speedMultiplier * effectModifier;
        speedDuration = speedDuration * effectModifier;
      }
      const speedDelta = mob._speed * speedMultiplier;
      mob.changeEffect(speedDelta, speedDuration, 'speed');
      return true;
    case '#e79600':
      logger.log('Drinking orange potion');
      let attackMultiplier = 0.5;
      let attackDuration = 240;
      if (effectModifier) {
        attackMultiplier = attackMultiplier * effectModifier;
        attackDuration = attackDuration * effectModifier;
      }
      const attackDelta = mob._attack * attackMultiplier;
      mob.changeEffect(attackDelta, attackDuration, 'attack');
      return true;
    case '#ef7d55':
      logger.log('Drinking gold potion');
      let healthIncrease = 20;
      if (effectModifier) healthIncrease = healthIncrease * effectModifier;
      mob.changeMaxHealth(healthIncrease, true);
      return true;
    case '#8b7f6e':
      logger.debug('Drinking grey potion');
      mob.changeSlowEnemy(1);
      return true;
    case '#ab00e7':
      logger.debug('Drinking purple potion');
      let defenseMultiplier = 0.5;
      let defenseDuration = 240;
      if (effectModifier) {
        defenseMultiplier = defenseMultiplier * effectModifier;
        defenseDuration = defenseDuration * effectModifier;
      }
      const defenseDelta = mob._defense * defenseMultiplier;
      mob.changeEffect(defenseDelta, defenseDuration, 'defense');
      return true;
    case '#00ff00':
      logger.debug('Drinking green potion');
      let dotDelta = 1;
      let dotDuration = 240;
      if (effectModifier) {
        dotDelta = dotDelta * effectModifier;
        dotDuration = dotDuration * effectModifier;
      }
      mob.changeEffect(dotDelta, dotDuration, 'damageOverTime');
      return true;
    case '#166060':
      logger.debug('Drinking black potion');
      let monsterDuration = 120;
      if (effectModifier) {
        monsterDuration = monsterDuration * effectModifier;
      }
      mob.spawnMonster(monsterDuration);
      return true;
    case '#614f79':
      console.log('Drinking bomb potion');
      let nearbyObjects = mob.findNClosestObjectIDs([], Infinity, 3) || [];
      let nearbyMobs = mob.findNearbyMobIDs(3) || [];

      // broadcast bomb message for client side animation
      pubSub.bomb(mob.id);

      // destroy all nearby objects
      nearbyObjects.forEach((id) => {
        const item = Item.getItem(id);
        if (item) {
          if (item.type === 'cauldron') {
            return; // dont destroy cauldrons!
          }
          const smashable = Smashable.fromItem(item);
          if (smashable) {
            // If smashable item, function that has extra side effects (drops loot)
            smashable.destroySmashable();
          }
          item.destroy(); // Actually removes from game world
        }
      });

      // destroy all nearby mobs
      nearbyMobs.forEach((mobID) => {
        const mobToDestroy = Mob.getMob(mobID);
        if (mobToDestroy) {
          mobToDestroy.destroy();
        } else {
          console.log(`Invalid mob ID: ${mobID}`);
        }
      });

      return true;

    default:
      // handle cases where potionStr doesn't match any known potion

      // check if potion is close to black
      if (closeToBlack(potionStr, mob)) {
        return true;
      }

      // check if potion string is close to another color
      let closestColor: string | null = null;
      let minDistance = Infinity;
      const upperThreshold = 9; // very similar
      const lowerThreshold = 20; // similar but not exact

      // Find the closest color in the dictionary
      for (const definedColor in colordict) {
        const dist = perceptualColorDistance(potionStr, definedColor);
        if (dist < minDistance) {
          minDistance = dist;
          closestColor = definedColor;
        }
      }

      // If the closest color is within the threshold, give weak potion effect
      if (closestColor && minDistance <= upperThreshold) {
        return drinkPotion(mob, String(hexStringToNumber(closestColor)), 0.5);
      } else if (closestColor && minDistance <= lowerThreshold) {
        return drinkPotion(mob, String(hexStringToNumber(closestColor)), 0.3);
      }

      // otherwise, given random effect
      else {
        giveRandomEffect(mob);
      }

      return true;
  }
}

function giveRandomEffect(mob: Mob) {
  const randomNum = Math.floor(Math.random() * 8); // amount of current effects
  switch (randomNum) {
    case 0:
      // Random Effect: Reduce Speed
      mob.changeEffect(mob._speed * -0.25, 20, 'speed');
      return true;
    case 1:
      // Reduce Health by 20 or to 1
      if (!mob || !Mob.getMob(mob.id)) {
        logger.error(
          `${mob.name} is no longer valid or does not exist in the database.`
        );
        return; // Exit early
      }
      if (mob.health > 20) {
        mob.changeHealth(-20);
      } else {
        mob.changeHealth(-mob.health + 1);
      }
      return true;
    case 2:
      // Random Effect: Reduce Defense
      mob.changeEffect(mob._defense * -0.25, 60, 'defense');
      return true;
    case 3:
      // Random Effect: Reduce Attack
      mob.changeEffect(mob._attack * -0.25, 60, 'attack');
      return true;
    case 4:
      // Random Effect: Permanently Reduce Player Health
      // reduce player health by 5 or to 1
      if (mob._maxHealth > 5) {
        mob.changeMaxHealth(-5);
      } else {
        mob.changeMaxHealth(-mob._maxHealth + 1);
      }
      return true;
    case 5:
      // Random Effect: Boost All Stats Slightly');
      mob.changeHealth(50);
      mob.changeEffect(mob._speed * 0.15, 60, 'speed');
      mob.changeEffect(mob._attack * 0.15, 60, 'attack');
      mob.changeEffect(mob._defense * 0.15, 60, 'defense');
      mob.changeMaxHealth(5, false);
      return true;
    case 6:
      // *Stun* Greatly Decrease Movement
      mob.changeEffect(mob._speed * -0.8, 10, 'speed');
      return true;
    case 7:
      // Random Effect: Reduce Gold
      if (mob.gold >= 5) {
        mob.changeGold(-5);
      } else {
        mob.changeGold(-mob.gold);
      }
  }
}

function closeToBlack(potionStr: string, mob: Mob): boolean {
  const thresholdBlack = 28; // 11% of 255 ~ 28
  const potionRgb = hexToRgb(potionStr);

  if (
    potionRgb.r < thresholdBlack &&
    potionRgb.g < thresholdBlack &&
    potionRgb.b < thresholdBlack
  ) {
    const carriedItem = mob.carrying;
    // delete the potion they just drank from the world
    if (carriedItem) {
      carriedItem.destroy();
    }
    mob.changeHealth(-mob.health);
    return true;
  }
  return false;
}
