import { Relax } from '../../../src/mobs/plans/relax';
import { Mob } from '../../../src/mobs/mob';
import { Needs } from '../../../src/mobs/traits/needs'; // Assuming this is where 'Needs' is imported from

describe('Relax Plan', () => {
  let relax: Relax;
  let mockNpc: Partial<Mob>;

  beforeEach(() => {
    relax = new Relax();
    // Mock only the necessary properties for the NPC
    mockNpc = {
      needs: {
        changeNeed: jest.fn(),
        getNeed: jest.fn(),
        mob: {} as Mob, // Mocking the 'mob' property, since it's expected by 'Needs'
        tick: jest.fn() // Mocking the 'tick' method of the 'Needs' object
      } as Needs, // Ensure 'needs' matches the 'Needs' type
      setMoveTarget: jest.fn(),
      position: { x: 10, y: 10 }
    };
  });

  test('execute changes energy need, sets move target, and returns false', () => {
    const result = relax.execute(mockNpc as Mob); // Cast to Mob
    expect(mockNpc.needs?.changeNeed).toHaveBeenCalledWith('energy', 10);
    expect(mockNpc.setMoveTarget).toHaveBeenCalledWith(mockNpc.position);
    expect(result).toBe(false);
  });

  test('utility returns max_energy minus energy', () => {
    (mockNpc.needs?.getNeed as jest.Mock).mockImplementation((need: string) => {
      if (need === 'max_energy') return 100;
      if (need === 'energy') return 70;
      return 0;
    });
    const util = relax.utility(mockNpc as Mob); // Cast to Mob
    expect(util).toBe(30);
  });

  test('description returns "Relaxing"', () => {
    expect(relax.description()).toBe('Relaxing');
  });

  test('reaction returns "Relaxing..."', () => {
    expect(relax.reaction()).toBe('Relaxing...');
  });

  test('type returns "relax"', () => {
    expect(relax.type()).toBe('relax');
  });
});
