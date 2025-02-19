import { MonstrousNames } from '../../../src/mobs/names/monstrousNames';

describe('MonstrousNames', () => {
  let monstrousNames: MonstrousNames;

  beforeEach(() => {
    monstrousNames = new MonstrousNames();
  });

  describe('generateName', () => {
    it('should generate a valid monstrous name', () => {
      const name = monstrousNames.generateName();
      expect(name).toMatch(/^[A-Z][a-z]+$/); // Name should be capitalized and have lowercase letters after
      expect(name.length).toBeGreaterThan(3); // Ensure the name is of reasonable length
    });
  });

  describe('generateRandomSyllableName', () => {
    it('should generate a name with the correct syllable count', () => {
      const minSyllables = 3;
      const maxSyllables = 5;
      const name = monstrousNames.generateRandomSyllableName(
        minSyllables,
        maxSyllables
      );
      const syllableCount = (name.match(/[aeiou]/g) || []).length;

      expect(syllableCount).toBeGreaterThanOrEqual(minSyllables);
      expect(syllableCount).toBeLessThanOrEqual(maxSyllables);
    });
  });

  // You can also test helper methods indirectly by testing the public ones.
  describe('randomElement', () => {
    it('should return an element from an array', () => {
      const mockArray = ['a', 'b', 'c'];
      const randomElement = monstrousNames['randomElement'](mockArray);
      expect(mockArray).toContain(randomElement); // Ensure it's from the array
    });
  });

  describe('randomInt', () => {
    it('should return a number in the specified range', () => {
      const randomInt = monstrousNames['randomInt'](1, 10);
      expect(randomInt).toBeGreaterThanOrEqual(1);
      expect(randomInt).toBeLessThanOrEqual(10);
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      const string = 'test';
      const capitalized = monstrousNames['capitalize'](string);
      expect(capitalized).toBe('Test');
    });
  });
});
