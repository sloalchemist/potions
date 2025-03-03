import { Community } from '../community/community';
import { Mob } from '../mobs/mob';
import { DB } from '../services/database';


export class Affiliation {

  /**
   * Update the mob's stats based on its affiliation
   */
  updateStatsBasedOnAffiliation(player: Mob): void {
    // Set default values before checking affiliation
    var player._maxHealth = 100;
    var player._attack = 5;
    var player._speed = 2.5;

    switch (player.community_id) {
      case 'silverclaw':
        // Silverclaw affiliation gives higher max health (200)
        player._maxHealth = 200;
        DB.prepare(`
          UPDATE mobs
          SET maxHealth = :maxHealth
          WHERE id = :id
        `).run({ maxHealth: player._maxHealth, id: player.id });
        break;

      case 'fighters':
        // Fighters affiliation gives higher speed (1.5x normal)
        player._speed = player._speed * 1.5;
        DB.prepare(`
          UPDATE mobs
          SET speed = :speed
          WHERE id = :id
        `).run({ speed: player._speed, id: player._id });
        break;

      case 'blobs':
        // Blobs affiliation gives higher attack (1.5x normal)
        player._attack = player._attack * 1.5;
        if (player._attack <= 0) {
            player._attack = 0; // Prevent negative attack values
        }
        DB.prepare(`
          UPDATE mobs
          SET attack = :attack
          WHERE id = :id
        `).run({ attack: player._attack, id: player.id });
        break;
    }
  }
}
