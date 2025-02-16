import { Heal } from '../../../src/mobs/plans/heal';
import { Mob } from '../../../src/mobs/mob';
import { PersonalityTraits } from '../../../src/mobs/traits/personality';
import { logistic } from '../../../src/util/mathUtil';

jest.mock('../../../src/util/mathUtil', () => ({
  logistic: jest.fn()
}));

describe('Heal Plan', () => {
  let heal: Heal;
  let mockNpc: Mob;

  beforeEach(() => {
    heal = new Heal();
    // Create a mock NPC with health below 100 and a Bravery trait value.
    mockNpc = {
      health: 50,
      personality: {
        traits: {
          [PersonalityTraits.Bravery]: 30
        }
      }
    } as any;
    (logistic as jest.Mock).mockReset();
  });

  test('benefit returns -Infinity if npc.health >= 100', () => {
    // Instead of reassigning mockNpc.health, create a new object with full health.
    const npcFullHealth = { ...mockNpc, health: 100 } as Mob;
    expect(heal.benefit(npcFullHealth)).toBe(-Infinity);
  });

  test('benefit calculates correct value when npc.health < 100', () => {
    // For npc.health = 50, npc.health/100 = 0.5.
    // Let's mock logistic to return 0.4.
    // Then healCoefficient = 1 - 0.4 = 0.6.
    // And benefit = 2 * 0.6 * (100 - 30) = 2 * 0.6 * 70 = 84.
    (logistic as jest.Mock).mockReturnValue(0.4);
    expect(heal.benefit(mockNpc)).toBeCloseTo(84);
  });

  test('description returns correct string', () => {
    expect(heal.description()).toBe("I'm looking for a potion to heal myself");
  });

  test('reaction returns correct string', () => {
    expect(heal.reaction()).toBe('I need a heal.');
  });

  test('type returns "heal"', () => {
    expect(heal.type()).toBe('heal');
  });
});
