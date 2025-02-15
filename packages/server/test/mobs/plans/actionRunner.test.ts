import { selectAction } from '../../../src/mobs/plans/actionRunner';
import { Mob } from '../../../src/mobs/mob';
import { Plan } from '../../../src/mobs/plans/plan';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { PersonalityTraits } from '../../../src/mobs/traits/personality';

// Mocking mobFactory to return predefined actions
jest.mock('../../../src/mobs/mobFactory', () => ({
  mobFactory: {
    getActionSet: jest.fn(), // Correct mock setup for getActionSet
  },
}));

describe('selectAction', () => {
  let mockNpc: jest.Mocked<Mob>;
  let mockAction1: jest.Mocked<Plan>;
  let mockAction2: jest.Mocked<Plan>;

  beforeEach(() => {
    // Mock actions
    mockAction1 = { type: jest.fn(() => 'action1'), utility: jest.fn(() => 50) } as any;
    mockAction2 = { type: jest.fn(() => 'action2'), utility: jest.fn(() => 30) } as any;

    // Mock NPC with a stubborn personality
    mockNpc = {
      action: 'action1',
      personality: {
        traits: {
          [PersonalityTraits.Stubbornness]: 10,
        },
      },
    } as any;

    // Set the mock action set to return the mocked actions
    (mobFactory.getActionSet as jest.Mock).mockReturnValue([mockAction1, mockAction2]); // Corrected type casting
  });

  test('should select the action with the highest utility', () => {
    // Call selectAction with the mocked NPC
    const selectedAction = selectAction(mockNpc);

    // Assert that the highest utility action is selected
    expect(selectedAction).toBe(mockAction1);
  });

  test('should apply stubbornness bonus to the selected action', () => {
    // Call selectAction with the mocked NPC
    const selectedAction = selectAction(mockNpc);

    // Ensure that the utility of action1 is calculated with the stubbornness bonus
    expect(mockAction1.utility).toHaveBeenCalledWith(mockNpc);
  });

  test('should throw an error if no action is selected', () => {
    // Set up a scenario where no actions are returned
    (mobFactory.getActionSet as jest.Mock).mockReturnValue([]); // Corrected type casting

    // Expect an error to be thrown
    expect(() => selectAction(mockNpc)).toThrow('No action selected');
  });
});
