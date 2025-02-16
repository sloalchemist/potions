import { Meal } from '../../../src/mobs/plans/meal'; // Adjust this import path according to your project structure
import { Mob } from '../../../src/mobs/mob'; // Ensure correct path for Mob type
import { Needs } from '../../../src/mobs/traits/needs';
import { PersonalityTraits } from '../../../src/mobs/traits/personality';

// Mock the itemGenerator to return a list of edible items
jest.mock('../../../src/items/itemGenerator', () => ({
  itemGenerator: {
    getEdibleItemTypes: jest
      .fn()
      .mockReturnValue([{ type: 'apple' }, { type: 'bread' }])
  }
}));

describe('Meal Plan', () => {
  let npc: Partial<Mob>; // Use Partial<Mob> to match type
  let meal: Meal;

  beforeEach(() => {
    npc = {
      needs: {
        getNeed: jest.fn().mockReturnValue(50),
        changeNeed: jest.fn(), // Mock function
        tick: jest.fn(), // Mock function
        mob: {} as Mob // Provide an empty object cast as Mob
      } as Needs, // Ensures it matches Needs interface

      personality: {
        traits: {
          [PersonalityTraits.Adventurousness]: 0, // Add adventurousness
          [PersonalityTraits.Stubbornness]: 0, // Default value for missing traits
          [PersonalityTraits.Bravery]: 0,
          [PersonalityTraits.Aggression]: 0,
          [PersonalityTraits.Industriousness]: 0,
          [PersonalityTraits.Gluttony]: 1.5, // Add gluttony
          [PersonalityTraits.Sleepy]: 0, // Add sleepy
          [PersonalityTraits.Extroversion]: 0
        }
      },
      getBasket: jest.fn().mockReturnValue(null)
    }; // Mock NPC
    meal = new Meal(npc as Mob); // Ensure proper type casting
  });

  it('should return the correct description', () => {
    const description = meal.description();
    expect(description).toBe('eating a meal');
  });

  it('should return the correct reaction', () => {
    const reaction = meal.reaction();
    expect(reaction).toBe('Time for a meal!');
  });

  it('should return the correct type', () => {
    const type = meal.type();
    expect(type).toBe('meal');
  });
});
