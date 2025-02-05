import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { Use } from './use';

export class EnterPortal implements Use {
  key: string;
  worlds: string[]; 
  constructor() {
    this.key = 'enter';
    this.worlds = ["Valoron", "Oozon"]
  }

  description(_mob: Mob, _item: Item): string {
    return 'Enter portal';
  }

  interact(mob: Mob, _item: Item): boolean {
    if (this.isNearPortal(mob)) {
      this.showWorldSelection(mob);
      return true;
    }
    return false;
  }

  private isNearPortal(mob: Mob): boolean {
    const portalPosition = { x: 10, y: 15 }; // Example portal position
    return (
      mob.position &&
      Math.abs(mob.position.x - portalPosition.x) <= 2 &&
      Math.abs(mob.position.y - portalPosition.y) <= 2
    );
  }

  private showWorldSelection(mob: Mob): void {
    mob.showMenu('Choose a world:', this.worlds, (selectedWorld) => {
      this.teleportToWorld(mob, selectedWorld);
    });
  }

  

  private teleportToWorld(mob: Mob, world: string): void {
    const worldDestinations: Record<string, { x: number; y: number }> = {
      Oozon: { x: 5, y: 5 },
      Valoron: { x: 50, y: 50 },
    };

    if (worldDestinations[world]) {
     // mob.changePosition(mob.world, worldDestinations[world]);
      mob.sendMessage(`You have entered ${world}!`);
    }
  } 
}
