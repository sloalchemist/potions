import { Meal } from '../../../src/mobs/plans/meal'; // Adjust this import path according to your project structure
import { itemGenerator } from '../../../src/items/itemGenerator'; // Adjust this import as well

// Mock the itemGenerator to return a list of edible items
jest.mock('../../../src/items/itemGenerator', () => ({
  itemGenerator: {
    getEdibleItemTypes: jest.fn().mockReturnValue([{ type: 'apple' }, { type: 'bread' }]),
  },
}));

describe('Meal Plan', () => {
  let npc: any; // Mock NPC object
  let meal: any;

  beforeEach(() => {
    npc = { 
      needs: { getNeed: jest.fn().mockReturnValue(50), setNeed: jest.fn() }, 
      personality: { traits: { Gluttony: 1.5 } }, 
      getBasket: jest.fn().mockReturnValue(null) 
    }; // Mock NPC
    meal = new Meal(npc); // Initializing Meal plan with the mocked NPC
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
