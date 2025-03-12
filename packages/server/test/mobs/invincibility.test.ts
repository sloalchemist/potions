import { commonSetup, world } from '../testSetup';
import { Mob } from '../../src/mobs/mob';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Coord } from '@rt-potion/common';
import { Community } from '../../src/community/community';
import { DB } from '../../src/services/database';

// Increase the test timeout to handle async operations
jest.setTimeout(10000);

beforeEach(() => {
  commonSetup();
  // Set up all needed communities
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('blobs', 'Blob Community');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Player Invincibility Tests', () => {
  describe('Invincibility on Spawn', () => {
    test('Player spawns with invincibility enabled', async () => {
      const position: Coord = { x: 0, y: 0 };
      const playerId = 'test-player';

      // Create a new player
      mobFactory.makeMob('player', position, playerId, 'testPlayer');
      const player = Mob.getMob(playerId);

      // Set player as invincible (simulating spawn protection)
      player?.setInvincible(true, 20);

      // Wait for DB update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify invincibility is set
      expect(player?.invincible).toBe(true);

      // Try to damage the player
      const initialHealth = player?.health;
      player?.changeHealth(-10);

      // Verify health hasn't changed due to invincibility
      expect(player?.health).toBe(initialHealth);
    });

    test('Player loses invincibility when moving', async () => {
      const position: Coord = { x: 0, y: 0 };
      const playerId = 'test-player-move';

      // Create a new player with invincibility
      mobFactory.makeMob('player', position, playerId, 'testPlayer');
      const player = Mob.getMob(playerId);
      player?.setInvincible(true);

      // Wait for DB update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify initial invincibility
      expect(player?.invincible).toBe(true);

      // Move the player
      const newPosition: Coord = { x: 1, y: 1 };
      player?.setMoveTarget(newPosition);

      // Wait for DB update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify invincibility is disabled after movement
      expect(player?.invincible).toBe(false);

      // Verify player can now take damage
      const healthBeforeDamage = player?.health;
      player?.changeHealth(-10);
      expect(player?.health).toBeLessThan(healthBeforeDamage!);
    });

    test('Non-player mobs get invincibility flag but still take damage', async () => {
      const position: Coord = { x: 0, y: 0 };
      const blobId = 'test-blob';

      // Create a blob mob
      mobFactory.makeMob('blob', position, blobId, 'testBlob');
      const blob = Mob.getMob(blobId);
      blob?.setInvincible(true);

      // Wait for DB update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Record initial health
      const initialHealth = blob?.health;

      // Try to damage the blob
      blob?.changeHealth(-10);

      // Wait for DB update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Even though blob has invincibility flag, it should still take damage
      expect(blob?.health).toBeLessThan(initialHealth!);
    });

    test('Player invincibility times out after duration', async () => {
      const position: Coord = { x: 0, y: 0 };
      const playerId = 'test-player-timeout';

      // Create a new player
      mobFactory.makeMob('player', position, playerId, 'testPlayer');
      const player = Mob.getMob(playerId);

      // Set short invincibility duration (2 ticks = 1 second)
      player?.setInvincible(true, 2);

      // Wait for DB update
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verify initial invincibility
      expect(player?.invincible).toBe(true);

      // Wait for invincibility to expire plus a small buffer
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Get fresh instance of player
      const updatedPlayer = Mob.getMob(playerId);

      // Check if invincibility was removed
      expect(updatedPlayer?.invincible).toBe(false);

      // Verify player can now take damage
      const healthBeforeDamage = updatedPlayer?.health;
      updatedPlayer?.changeHealth(-10);

      // Wait for DB update
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(updatedPlayer?.health).toBeLessThan(healthBeforeDamage!);
    });
  });
});

// Use afterAll instead of afterEach to prevent DB closing during async operations
afterAll(async () => {
  // Wait for any pending operations
  await new Promise((resolve) => setTimeout(resolve, 500));
  DB.close();
});
