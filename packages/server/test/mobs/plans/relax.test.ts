import { Relax } from '../../../src/mobs/plans/relax';
import { Mob } from '../../../src/mobs/mob';

describe('Relax Plan', () => {
  let relax: Relax;
  let mockNpc: jest.Mocked<Mob>;

  beforeEach(() => {
    relax = new Relax();
    // Create a mock NPC with necessary methods and properties.
    mockNpc = {
      needs: {
        changeNeed: jest.fn(),
        getNeed: jest.fn(),
      },
      setMoveTarget: jest.fn(),
      // Assume a valid position exists.
      position: { x: 10, y: 10 },
    } as any;
  });

  test('execute changes energy need, sets move target, and returns false', () => {
    const result = relax.execute(mockNpc);
    expect(mockNpc.needs.changeNeed).toHaveBeenCalledWith('energy', 10);
    expect(mockNpc.setMoveTarget).toHaveBeenCalledWith(mockNpc.position);
    expect(result).toBe(false);
  });

  test('utility returns max_energy minus energy', () => {
    // For example, set max_energy = 100 and energy = 70 so utility should be 30.
    (mockNpc.needs.getNeed as jest.Mock).mockImplementation((need: string) => {
      if (need === 'max_energy') return 100;
      if (need === 'energy') return 70;
      return 0;
    });
    const util = relax.utility(mockNpc);
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
