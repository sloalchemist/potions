import { Mob } from '../mobs/mob';

export class Affiliation {
  /**
   * Update the mob's stats based on its affiliation
   */
  updateStatsBasedOnAffiliation(player: Mob): void {
    // Set default values before checking affiliation
    player.setMaxHealth(100);
    player.setSpeed(2.5);
    player.setAttack(5);

    switch (player.community_id) {
      case 'silverclaw':
        // Silverclaw affiliation gives higher max health (200)
        player.setMaxHealth(200);
        break;

      case 'fighters':
        // Fighters affiliation gives higher speed (1.5x normal)
        player.setSpeed(player._speed * 1.5);
        break;

      case 'blobs':
        // Blobs affiliation gives higher attack (1.5x normal)
        player.setAttack(player._attack * 1.5);
        break;
    }
  }
}
