import { Wander } from '../../../src/mobs/plans/wander';
import { Mob } from '../../../src/mobs/mob';
import { PersonalityTraits } from '../../../src/mobs/traits/personality';
import { gameWorld } from '../../../src/services/gameWorld/gameWorld';

// Mock gameWorld.spawnCoord so we can control its output.
jest.mock('../../../src/services/gameWorld/gameWorld', () => ({
  gameWorld: {
    spawnCoord: jest.fn(),
  },
}));

describe('Wander Plan', () => {
  let wander: Wander;
  let mockNpc: jest.Mocked<Mob>;

  beforeEach(() => {
    wander = new Wander();
    // Create a basic mock NPC with required methods and personality traits.
    mockNpc = {
      personality: {
        traits: {
          [PersonalityTraits.Adventurousness]: 42, // sample value
        },
      },
      isNotMoving: jest.fn(),
      setMoveTarget: jest.fn(),
    } as any;

    // Reset spawnCoord mock before each test.
    (gameWorld.spawnCoord as jest.Mock).mockReset();
  });

  test('execute calls setMoveTarget if npc is not moving', () => {
    // Simulate that the NPC is not moving.
    (mockNpc.isNotMoving as jest.Mock).mockReturnValue(true);
    const fakeCoord = { x: 5, y: 5 };
    (gameWorld.spawnCoord as jest.Mock).mockReturnValue(fakeCoord);

    const result = wander.execute(mockNpc);

    expect(mockNpc.setMoveTarget).toHaveBeenCalledWith(fakeCoord);
    expect(result).toBe(true);
  });

  test('execute does not call setMoveTarget if npc is moving', () => {
    // Simulate that the NPC is moving.
    (mockNpc.isNotMoving as jest.Mock).mockReturnValue(false);

    const result = wander.execute(mockNpc);

    expect(mockNpc.setMoveTarget).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  test('utility returns the adventurousness trait value', () => {
    const util = wander.utility(mockNpc);
    expect(util).toBe(42);
  });

  test('description returns the correct string', () => {
    expect(wander.description()).toBe('wandering around and greeting others');
  });

  test('reaction returns the correct string', () => {
    expect(wander.reaction()).toBe('I am wandering around');
  });

  test('type returns "wander"', () => {
    expect(wander.type()).toBe('wander');
  });
});
