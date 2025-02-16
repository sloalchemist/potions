import { Flee } from '../../../src/mobs/plans/flee';
import { Mob } from '../../../src/mobs/mob';
import { PersonalityTraits } from '../../../src/mobs/traits/personality';
import { gameWorld } from '../../../src/services/gameWorld/gameWorld';
import {
  addVectorAndMagnitude,
  getCoordinatesWithinRadius,
  normalizedSubtraction
} from '@rt-potion/common';

// Mock the utility functions from @rt-potion/common
jest.mock('@rt-potion/common', () => ({
  addVectorAndMagnitude: jest.fn(),
  getCoordinatesWithinRadius: jest.fn(),
  normalizedSubtraction: jest.fn()
}));

// Mock gameWorld.spawnCoord
jest.mock('../../../src/services/gameWorld/gameWorld', () => ({
  gameWorld: {
    spawnCoord: jest.fn()
  }
}));

describe('Flee Plan', () => {
  let flee: Flee;
  let mockNpc: Mob;
  let mockEnemy: Mob;

  beforeEach(() => {
    flee = new Flee();

    // Create a fresh mock NPC object.
    // We use an object literal (and cast as any) so that we can later create modified copies.
    mockNpc = {
      name: 'NPC1',
      position: { x: 10, y: 10 },
      setMoveTarget: jest.fn(),
      findClosestEnemyID: jest.fn(() => 'enemy1'),
      community_id: 'community1',
      visionDistance: 5,
      health: 100,
      personality: {
        traits: {
          [PersonalityTraits.Bravery]: 20
        }
      },
      action: 'flee'
    } as any;

    // Create a fresh mock enemy object.
    mockEnemy = {
      name: 'Enemy1',
      position: { x: 0, y: 0 },
      health: 50,
      type: 'monster' // Set at initialization.
    } as any;

    // Mock Mob.getMob to return mockEnemy when requested.
    Mob.getMob = jest.fn((id: string) =>
      id === 'enemy1' ? mockEnemy : undefined
    );

    // Reset mocks for the imported functions.
    (normalizedSubtraction as jest.Mock).mockReset();
    (addVectorAndMagnitude as jest.Mock).mockReset();
    (getCoordinatesWithinRadius as jest.Mock).mockReset();
    (gameWorld.spawnCoord as jest.Mock).mockReset();
  });

  // --- Tests for execute() ---

  test('execute returns true if enemy or positions are missing', () => {
    // Case 1: no enemy defined
    flee.enemy = undefined;
    expect(flee.execute(mockNpc)).toBe(true);

    // Case 2: enemy has no position.
    flee.enemy = { ...mockEnemy, position: undefined } as any;
    expect(flee.execute(mockNpc)).toBe(true);

    // Case 3: NPC has no position.
    const npcNoPos = { ...mockNpc, position: undefined } as any;
    flee.enemy = mockEnemy;
    expect(flee.execute(npcNoPos)).toBe(true);
  });

  test('execute moves NPC to spawn coord if at same position as enemy', () => {
    // Set enemy's position equal to NPC's position.
    flee.enemy = { ...mockEnemy, position: { ...mockNpc.position } } as any;
    const fakeSpawn = { x: 20, y: 20 };
    (gameWorld.spawnCoord as jest.Mock).mockReturnValue(fakeSpawn);

    const result = flee.execute(mockNpc);
    expect(mockNpc.setMoveTarget).toHaveBeenCalledWith(fakeSpawn);
    expect(result).toBe(false);
  });

  test('execute returns false when a valid flee coordinate is found', () => {
    // Ensure enemy is defined and positions differ.
    flee.enemy = mockEnemy;

    // Simulate normalizedSubtraction returns a vector.
    (normalizedSubtraction as jest.Mock).mockReturnValue({ x: 0.8, y: 0.6 });
    // Simulate addVectorAndMagnitude returns a valid flee coordinate.
    const fleeCoord = { x: 16, y: 16 };
    (addVectorAndMagnitude as jest.Mock).mockReturnValue(fleeCoord);
    // Simulate getCoordinatesWithinRadius returns an array of coordinates.
    const possibleCoords = [
      { x: 15, y: 15 },
      { x: 16, y: 16 }
    ];
    (getCoordinatesWithinRadius as jest.Mock).mockReturnValue(possibleCoords);

    // Simulate npc.setMoveTarget returning true for the coordinate {16,16}.
    (mockNpc.setMoveTarget as jest.Mock).mockImplementation((coord: any) => {
      return coord.x === 16 && coord.y === 16;
    });

    const result = flee.execute(mockNpc);
    expect(result).toBe(false);
    expect(mockNpc.setMoveTarget).toHaveBeenCalled();
  });

  test('execute throws error if no valid flee point is found', () => {
    // Force enemy defined and positions differ.
    flee.enemy = mockEnemy;
    (normalizedSubtraction as jest.Mock).mockReturnValue({ x: 1, y: 1 });
    // Simulate addVectorAndMagnitude returns a falsy value.
    (addVectorAndMagnitude as jest.Mock).mockReturnValue(null);
    // Simulate getCoordinatesWithinRadius returns an empty array.
    (getCoordinatesWithinRadius as jest.Mock).mockReturnValue([]);

    expect(() => flee.execute(mockNpc)).toThrowError(/failed to flee/);
  });

  // --- Tests for utility() ---

  test('utility returns -Infinity if NPC position is missing', () => {
    const npcNoPos = { ...mockNpc, position: undefined } as any;
    const util = flee.utility(npcNoPos);
    expect(util).toBe(-Infinity);
  });

  //   test('utility returns -Infinity if no enemy is found', () => {
  //     // Simulate findClosestEnemyID returns null.
  //     mockNpc.findClosestEnemyID = jest.fn((): string | undefined => null);
  //     const util = flee.utility(mockNpc);
  //     expect(util).toBe(-Infinity);
  //   });

  test('utility returns computed value when enemy is found', () => {
    // Ensure findClosestEnemyID returns enemy id.
    mockNpc.findClosestEnemyID = jest.fn(() => 'enemy1');
    // For visionMultiple: if npc.action equals flee.type() ('flee'), visionMultiple is 2.
    const npcWithAction = { ...mockNpc, action: 'flee' } as any;
    // Set Bravery trait to 30, npc.health = 100, enemy.health = 50.
    npcWithAction.personality.traits[PersonalityTraits.Bravery] = 30;
    const npcWithHealth = { ...npcWithAction, health: 100 } as any;
    //mockEnemy.health = 50;
    const util = flee.utility(npcWithHealth);
    const expectedUtility = (100 - 30) * (50 / 100); // 70 * 0.5 = 35
    expect(util).toBe(expectedUtility);
  });

  // --- Tests for description, reaction, type ---

  test('description returns correct string', () => {
    // To test description, set enemy with type.
    const enemyWithType = { ...mockEnemy, type: 'monster' } as any;
    flee.enemy = enemyWithType;
    const desc = flee.description();
    expect(desc).toContain(enemyWithType.name);
    expect(desc).toContain('monster');
  });

  test('reaction returns correct string', () => {
    flee.enemy = mockEnemy;
    const react = flee.reaction();
    expect(react).toContain(mockEnemy.name);
  });

  test('type returns "flee"', () => {
    expect(flee.type()).toBe('flee');
  });
});
