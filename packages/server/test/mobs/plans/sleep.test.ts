import { Sleep } from '../../../src/mobs/plans/sleep';
import { Mob } from '../../../src/mobs/mob';
import { HOURS_IN_DAY } from '@rt-potion/common';
import { logistic } from '../../../src/util/mathUtil';
import { gameWorld } from '../../../src/services/gameWorld/gameWorld';
import { PersonalityTraits } from '../../../src/mobs/traits/personality';

jest.mock('../../../src/util/mathUtil', () => ({
  logistic: jest.fn(),
}));

jest.mock('../../../src/services/gameWorld/gameWorld', () => ({
  gameWorld: {
    getPortal: jest.fn(),
    currentDate: jest.fn(),
    spawnCoord: jest.fn(),
  },
}));

describe('Sleep Plan', () => {
  let sleepPlan: Sleep;
  let mockNpc: Mob;

  beforeEach(() => {
    sleepPlan = new Sleep();

    // Create a basic mock NPC with necessary properties and methods.
    mockNpc = {
      needs: {
        changeNeed: jest.fn(),
        getNeed: jest.fn(),
      },
      setMoveTarget: jest.fn(),
      moveToOrExecute: jest.fn(),
      getHouse: jest.fn(),
      changeHealth: jest.fn(),
      position: { x: 10, y: 10 },
      personality: {
        traits: {},
      },
    } as any;

    // Reset gameWorld and logistic mocks.
    (gameWorld.getPortal as jest.Mock).mockReset();
    (gameWorld.currentDate as jest.Mock).mockReset();
    (gameWorld.spawnCoord as jest.Mock).mockReset();
    (logistic as jest.Mock).mockReset();
  });

  // --- Tests for execute() ---
  test('execute uses house if available', () => {
    const mockHouse = {
      id: 'house1',
      center: jest.fn(() => ({ x: 5, y: 5 })),
    };
    (mockNpc.getHouse as jest.Mock).mockReturnValue(mockHouse);
    // Set global_tick so that the energy/health block is not triggered.
    (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: 1 });
    
    const result = sleepPlan.execute(mockNpc);
    expect(mockHouse.center).toHaveBeenCalled();
    expect(mockNpc.setMoveTarget).toHaveBeenCalledWith({ x: 5, y: 5 });
    expect(result).toBe(false);
  });

  test('execute uses portal if no house and portal has position', () => {
    (mockNpc.getHouse as jest.Mock).mockReturnValue(null);
    const fakePortal = {
      position: { x: 20, y: 20 },
      interact: jest.fn(),
    };
    (gameWorld.getPortal as jest.Mock).mockReturnValue(fakePortal);
    // Simulate npc.moveToOrExecute calls its callback.
    (mockNpc.moveToOrExecute as jest.Mock).mockImplementation((pos, num, callback) => callback());
    (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: 1 });

    const result = sleepPlan.execute(mockNpc);
    expect(mockNpc.moveToOrExecute).toHaveBeenCalledWith({ x: 20, y: 20 }, 1, expect.any(Function));
    expect(fakePortal.interact).toHaveBeenCalledWith(mockNpc, 'enter');
    expect(result).toBe(false);
  });

  test('execute throws error if portal has no position', () => {
    (mockNpc.getHouse as jest.Mock).mockReturnValue(null);
    const fakePortal = {
      position: undefined,
      interact: jest.fn(),
    };
    (gameWorld.getPortal as jest.Mock).mockReturnValue(fakePortal);
    (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: 1 });
    expect(() => sleepPlan.execute(mockNpc)).toThrow('No portal position found');
  });

  test('execute triggers energy/health changes when global_tick condition met and returns true if max_energy >= 100', () => {
    // Simulate global_tick condition: divisible by 48.
    (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: 48 });
    const mockHouse = {
      center: jest.fn(() => ({ x: 5, y: 5 })),
    };
    (mockNpc.getHouse as jest.Mock).mockReturnValue(mockHouse);
    (mockNpc.needs.getNeed as jest.Mock).mockImplementation((need: string) => {
      if (need === 'max_energy') return 100;
      if (need === 'energy') return 50;
      return 0;
    });
    const result = sleepPlan.execute(mockNpc);
    expect(mockNpc.needs.changeNeed).toHaveBeenCalledWith('max_energy', 25);
    expect(mockNpc.needs.changeNeed).toHaveBeenCalledWith('energy', 25);
    expect(mockNpc.changeHealth).toHaveBeenCalledWith(10);
    expect(result).toBe(true);
  });

  test('execute returns false when global_tick condition met but max_energy < 100', () => {
    (gameWorld.currentDate as jest.Mock).mockReturnValue({ global_tick: 48 });
    const mockHouse = {
      center: jest.fn(() => ({ x: 5, y: 5 })),
    };
    (mockNpc.getHouse as jest.Mock).mockReturnValue(mockHouse);
    (mockNpc.needs.getNeed as jest.Mock).mockImplementation((need: string) => {
      if (need === 'max_energy') return 80;
      if (need === 'energy') return 50;
      return 0;
    });
    const result = sleepPlan.execute(mockNpc);
    expect(result).toBe(false);
  });

  // --- Tests for utility() ---


  test('utility computes sleep utility correctly', () => {
    // Set current hour to 10.
    (gameWorld.currentDate as jest.Mock).mockReturnValue({ hour: 10, global_tick: 1 });
    // Calculate: distanceFromMidnight = (HOURS_IN_DAY/2) - |(HOURS_IN_DAY/2 - 10)|
    // For HOURS_IN_DAY=24, that is 12 - |12-10| = 12 - 2 = 10.
    // Let logistic return 0.7.
    (logistic as jest.Mock).mockReturnValue(0.7);
    (mockNpc.needs.getNeed as jest.Mock).mockImplementation((need: string) => {
      if (need === 'max_energy') return 80;
      return 0;
    });
    // Set Sleepy trait. For example, 5.
    mockNpc.personality.traits[PersonalityTraits.Sleepy] = 5;
    const util = sleepPlan.utility(mockNpc);
    // Expected sleepUtility = 0.7 * (1 - 80/100) * 5 = 0.7 * 0.2 * 5 = 0.7
    expect(util).toBeCloseTo(0.7);
  });

  // --- Tests for description, reaction, type ---
  test('description returns "Sleeping"', () => {
    expect(sleepPlan.description()).toBe('Sleeping');
  });

  test('reaction returns "zzz"', () => {
    expect(sleepPlan.reaction()).toBe('zzz');
  });

  test('type returns "sleep"', () => {
    expect(sleepPlan.type()).toBe('sleep');
  });
});
