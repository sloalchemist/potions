import { Mob } from '../mobs/mob';
import { numberToHexString, hexToRgb, perceptualColorDistance } from '../util/colorUtil';

interface ColorDict {
  [key: string]: string;
}

const colordict: ColorDict = {
  '#ff0000': 'red',
  '#0000ff': 'blue',
  '#e79600': 'orange',
  '#ef7d55': 'gold',
  '#8b7f6e': 'grey',
  '#ab00e7': 'purple',
}

export function drinkPotion(mob: Mob, potionType: string, effectModifier?:number): boolean {

  const potionStr = numberToHexString(Number(potionType));

  console.log('Drinking potion of type:', potionStr);

  switch (potionStr) {
    case '#ff0000':
      console.log('Drinking red potion');
      let healthValue = 50;
      if(effectModifier)
        healthValue = healthValue * effectModifier;
      mob.changeHealth(healthValue);
      return true;
    case '#0000ff':
      console.log('Drinking blue potion');
      console.log(mob._speed);
      let speedMultiplier = 0.5;
      let speedDuration = 30;
      if(effectModifier){
        speedMultiplier = speedMultiplier * effectModifier;
        speedDuration = speedDuration * effectModifier;
      }
      const speedDelta = mob._speed * speedMultiplier;
      mob.changeEffect(speedDelta, speedDuration, 'speed');
      return true;
    case '#e79600':
      console.log('Drinking orange potion');
      let attackMultiplier = 0.5;
      let attackDuration = 240;
      if(effectModifier){
        attackMultiplier = attackMultiplier * effectModifier;
        attackDuration = attackDuration * effectModifier
      }
      const attackDelta = mob._attack * attackMultiplier;
      mob.changeEffect(attackDelta, attackDuration, 'attack');
      return true;
    case '#ef7d55':
      console.log('Drinking gold potion');
      let healthIncrease = 20;
      if(effectModifier)
        healthIncrease = healthIncrease * effectModifier;
      mob.changeMaxHealth(healthIncrease, true);
      return true;
    case '#8b7f6e':
      console.log('Drinking grey potion');
      mob.changeSlowEnemy(1);
      return true;
    case '#ab00e7':
      console.log('Drinking purple potion');
      let defenseMultiplier = 0.5;
      let defenseDuration = 240;
      if(effectModifier){
        defenseMultiplier = defenseMultiplier * effectModifier;
        defenseDuration = defenseDuration * effectModifier;
      }
      const defenseDelta = mob._defense * 0.5;
      mob.changeEffect(defenseDelta, defenseDuration, 'defense');
      return true;
    default:
      // handle cases where potionStr doesn't match any known potion
      console.log('Unknown potion color');

      //check if potion is close to black
      if(closeToBlack(potionStr, mob)){
        return true;
      }

      //check if potion string is close to another color
      let closestColor: string | null = null;
      let minDistance = Infinity;
      const upperThreshold = 20; // 20 is very similar
      const lowerThreshold = 35; // 35 is similar but not exact

      // Find the closest color in the dictionary
      for (const definedColor in colordict) {
        const dist = perceptualColorDistance(potionStr, definedColor);
        if (dist < minDistance) {
          minDistance = dist;
          closestColor = definedColor;
        }
      }
      console.log('Distance:', minDistance);

      // If the closest color is within the threshold, give weak potion effect
      if (closestColor && minDistance <= upperThreshold) {
        return drinkPotion(mob, closestColor, 0.7);
      }
      else if(closestColor && minDistance <= lowerThreshold){
        return drinkPotion(mob, closestColor, 0.5);
      }

      // otherwise, given random effect
      else {
        giveRandomEffect(mob);
      }
          
      return true;
  }
}

function giveRandomEffect(mob: Mob) {
  const randomNum = Math.floor(Math.random() * 7); // amount of current effects

  switch (randomNum) {
    case 0:
      console.log('Random Effect: Reduce Player Speed');
      mob.changeEffect(mob._speed*-0.25, 60, 'speed');
      return true;
    case 1:
      console.log('Random Effect: Reduce Player Health');
      // reduce player health by 20 or to 1
      if (mob.health > 20) {
        mob.changeHealth(-20);
      }
      else {
        mob.changeHealth(-mob.health + 1);
      }
      return true;
    case 2:
      console.log('Random Effect: Reduce Play Defense');
      mob.changeEffect(mob._defense*-0.25, 60, 'defense');
      return true;
    case 3:
      console.log('Random Effect: Reduce Player Attack');
      mob.changeEffect(mob._attack*-0.25, 60, 'attack');
      return true;
    case 4:
      console.log('Random Effect: Permanently Reduce Player Health');
      // reduce player health by 5 or to 1
      if (mob._maxHealth > 5) {
        mob.changeMaxHealth(mob._maxHealth - 5);
      }
      else {
        mob.changeMaxHealth(1);
      }
      return true;
    case 5:
      console.log('Random Effect: Boost All Player Stats Slightly');
      mob.changeHealth(50);
      mob.changeEffect(mob._speed*0.15, 60, 'speed');
      mob.changeEffect(mob._attack*0.15 , 60, 'attack');
      mob.changeEffect(mob._defense*0.15, 60, 'defense');
      mob.changeMaxHealth(5, false);
      return true;
    case 6:
      console.log("Random Effect: *Stun* Greatly Decrease Player Movement");
      mob.changeEffect(mob._speed*-0.80, 10, 'speed');
      return true;
    default:
      console.log('Random Effect: No Effect');
      return true;

  }
}

function closeToBlack(potionStr: string, mob: Mob): boolean {
  const thresholdBlack = 28; // 11% of 255 ~ 28
  const potionRgb = hexToRgb(potionStr);

  if (potionRgb.r < thresholdBlack && potionRgb.g < thresholdBlack && potionRgb.b < thresholdBlack) {
    console.log('Potion is close to black.');
    mob.changeHealth(-mob.health);
    return true;
  }
  return false;
}
