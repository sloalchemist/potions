import { commonSetup, world, itemGenerator } from '../testSetup';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Mob } from '../../src/mobs/mob';
import { DB } from '../../src/services/database';
import { Community } from '../../src/community/community';
import { Carryable } from '../../src/items/carryable';
import { Item } from '../../src/items/item';
import { Coord } from '@rt-potion/common';

beforeEach(() => {
  commonSetup();
  const alchemistVil = Community.makeVillage('alchemists', 'Alchemists guild');
  const fightersVil = Community.makeVillage('fighters', 'Fighters guild');
  Community.makeAlliance(alchemistVil, fightersVil);
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Item Giving Tests', () => {
  describe('Player and Fighter Item Exchange', () => {
    test('Should allow item exchange between player and fighter mob', () => {
      const position1: Coord = { x: 0, y: 0 };
      const position2: Coord = { x: 1, y: 1 };
      const potionPosition: Coord = { x: 2, y: 2 };

      // Create player mob
      mobFactory.makeMob('player', position1, '1', 'testPlayer');
      const playerMob = Mob.getMob('1');
      expect(playerMob).toBeDefined();

      // Create fighter mob
      mobFactory.makeMob('fighter', position2, '3', 'testFighter');
      const fighterMob = Mob.getMob('3');
      expect(fighterMob).toBeDefined();

      // Create potion
      itemGenerator.createItem({ type: 'potion', position: potionPosition });
      const potionID = Item.getItemIDAt(potionPosition);
      expect(potionID).not.toBeNull();

      const potion = Item.getItem(potionID!);
      expect(potion).toBeDefined();

      const carryablePotion = Carryable.fromItem(potion!);
      expect(carryablePotion).toBeDefined();

      // Player picks up the potion
      carryablePotion!.pickup(playerMob!);
      expect(playerMob!.carrying).toBeDefined();

      // Attempt to give the potion to fighter mob
      const result = carryablePotion!.giveItem(playerMob!, fighterMob!);

      // Assertions
      expect(result).toBe(true); // Item should be passed
      expect(playerMob!.carrying).toBeUndefined(); // Player should not have the potion
      expect(fighterMob!.carrying).toBeDefined(); // Fighter should have the potion
    });
  });
});

afterEach(() => {
  DB.close();
});
