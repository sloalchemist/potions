import { selectAction } from '../../../src/mobs/plans/actionRunner';
import { Mob } from '../../../src/mobs/mob';
import { Plan } from '../../../src/mobs/plans/plan';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { PersonalityTraits } from '../../../src/mobs/traits/personality';

// Mocking mobFactory to return predefined actions
jest.mock('../../../src/mobs/mobFactory', () => ({
  mobFactory: {
    getActionSet: jest.fn() // Correct mock setup for getActionSet
  }
}));

describe('selectAction', () => {
  let mockNpc: jest.Mocked<Mob>;
  let mockAction1: Plan;
  let mockAction2: Plan;

  beforeEach(() => {
    // Mock actions
    mockAction1 = {
      type: jest.fn(() => 'action1'),
      utility: jest.fn((npc: Mob) => {
        console.log('utility called with', npc); // Debugging log
        return 50 + npc.personality.traits[PersonalityTraits.Stubbornness];
      }),
      execute: jest.fn(() => true), // Corrected to include npc argument
      description: jest.fn(() => 'Action 1 description'),
      reaction: jest.fn(() => 'Action 1 reaction')
    } as Plan;

    mockAction2 = {
      type: jest.fn(() => 'action2'),
      utility: jest.fn(
        (npc: Mob) =>
          30 + npc.personality.traits[PersonalityTraits.Stubbornness]
      ),
      execute: jest.fn(() => true), // Corrected to include npc argument
      description: jest.fn(() => 'Action 2 description'),
      reaction: jest.fn(() => 'Action 2 reaction')
    } as Plan;

    // Mock NPC with a stubborn personality
    mockNpc = {
      action: 'action1',
      personality: {
        traits: {
          [PersonalityTraits.Stubbornness]: 10
        }
      }
    } as jest.Mocked<Mob>;

    // Set the mock action set to return the mocked actions
    (mobFactory.getActionSet as jest.Mock).mockReturnValue([
      mockAction1,
      mockAction2
    ]);
  });

  test('should apply stubbornness bonus to the selected action', () => {
    // Call selectAction with the mocked NPC
    selectAction(mockNpc);

    // Ensure that the utility of action1 is calculated with the stubbornness bonus
    expect(mockAction1.utility).toHaveBeenCalledWith(mockNpc);
    // Check if the correct value was passed based on stubbornness
    expect(mockAction1.utility).toHaveBeenCalledWith(
      expect.objectContaining({
        personality: {
          traits: {
            [PersonalityTraits.Stubbornness]: 10
          }
        }
      })
    );
  });

  test('should throw an error if no action is selected', () => {
    // Set up a scenario where no actions are returned
    (mobFactory.getActionSet as jest.Mock).mockReturnValue([]);

    // Expect an error to be thrown
    expect(() => selectAction(mockNpc)).toThrow('No action selected');
  });
});
