import { Mob } from '../mob';
import { HOURS_IN_DAY } from '@rt-potion/common';
import { PersonalityTraits } from '../traits/personality';
import { logistic } from '../../util/mathUtil';
import { Plan } from './plan';
import { gameWorld } from '../../services/gameWorld/gameWorld';

export class Sleep implements Plan {
  execute(npc: Mob): boolean {
    //console.log('Sleeping', this.sleepTurns, world.fantasyDate.hour, world.fantasyDate.description());
    const house = npc.getHouse();
    if (house) {
      //console.log(`${npc.name} sleeping, moving to house ${house.id} at ${house.center().x}, ${house.center().y}`);
      npc.setMoveTarget(house.center());
    } else {
      const portal = gameWorld.getPortal();
      if (!portal.position) {
        throw new Error('No portal position found');
      }
      npc.moveToOrExecute(portal.position, 1, () => {
        portal.interact(npc, 'enter');
        return true;
      });
    }

    if (gameWorld.currentDate().global_tick % (12 * 4) === 0) {
      npc.needs.changeNeed('max_energy', 25);
      npc.needs.changeNeed('energy', 25);
      npc.changeHealth(10);

      if (npc.needs.getNeed('max_energy') >= 100) {
        return true;
      }
    }

    return false;
  }

  utility(npc: Mob): number {
    const hour = gameWorld.currentDate().hour;

    // Adjust hour to a continuous scale where 9 is 0 and 4 is 12
    const distanceFromMidnight =
      HOURS_IN_DAY / 2 - Math.abs(HOURS_IN_DAY / 2 - hour);
    const sleepPull = logistic(distanceFromMidnight, -2, 4);

    const sleepUtility =
      sleepPull *
      (1 - npc.needs.getNeed('max_energy') / 100) *
      npc.personality.traits[PersonalityTraits.Sleepy];
    //console.log('Sleep pull:', sleepPull, 'Distance from midnight: ', distanceFromMidnight, 'Sleep utility:', sleepUtility, 'Hour:', hour, 'Sleep:', npc.personality.traits[PersonalityTraits.Sleepy]);
    return sleepUtility;
  }
  /*
    desire(npc: NPC, world: ServerWorld): Desire[] {
        return [];
    }*/

  description(): string {
    return 'Sleeping';
  }

  reaction(): string {
    return 'zzz';
  }

  type(): string {
    return 'sleep';
  }
}
