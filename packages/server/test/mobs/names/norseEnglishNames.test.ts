import { NorseEnglishNames } from '../../../src/mobs/names/norseEnglishNames';

describe('NorseEnglishNames', () => {
  let norseEnglishNames: NorseEnglishNames;

  beforeEach(() => {
    norseEnglishNames = new NorseEnglishNames();
  });

  // Test for generateName method
  it('should generate a name with either a Nordic or English prefix and suffix', () => {
    const name = norseEnglishNames.generateName();
    
    const nordicPrefixes = [
      'Bjorn', 'Eirik', 'Hakon', 'Ivar', 'Knut', 'Leif', 'Sigurd', 'Thor', 'Ulf', 'Vidar'
    ];

    const englishPrefixes = [
      'Ash', 'Black', 'Bright', 'Cinder', 'Dark', 'Earth', 'Fire', 'Frost', 'Iron', 'Light', 'Oak', 'Shadow', 'Silver', 'Stone', 'Storm', 'Thorn', 'White', 'Wolf'
    ];

    const nordicSuffixes = [
      'heim', 'fjord', 'lund', 'skov', 'strand', 'vik', 'voll', 'gaard', 'berg', 'dal'
    ];

    const englishSuffixes = [
      'dale', 'fall', 'field', 'ford', 'gate', 'hall', 'haven', 'holm', 'mere', 'ridge', 'shire', 'stead', 'stone', 'vale', 'wood'
    ];

    // Ensure the prefix is either Nordic or English
    const prefix = name.slice(0, 1).toUpperCase() + name.slice(1).split(/(?=[A-Z])/)[0];
    const suffix = name.slice(name.lastIndexOf(prefix));

    expect(
      nordicPrefixes.some((prefix) => name.startsWith(prefix)) ||
      englishPrefixes.some((prefix) => name.startsWith(prefix))
    ).toBe(true);

    expect(
      nordicSuffixes.some((suffix) => name.endsWith(suffix)) ||
      englishSuffixes.some((suffix) => name.endsWith(suffix))
    ).toBe(true);
  });


  it('should generate names within the specified syllable range (min/max)', () => {
    const minSyllables = 2;
    const maxSyllables = 4;
    const name = norseEnglishNames.generateRandomSyllableName(minSyllables, maxSyllables);
    const syllableCount = name.match(/[aeiouy]/g)?.length || 0;

    expect(syllableCount).toBeGreaterThanOrEqual(minSyllables);
    expect(syllableCount).toBeLessThanOrEqual(maxSyllables);
  });

  // Test randomElement utility function
  it('should return a valid random element from an array', () => {
    const testArray = ['apple', 'banana', 'cherry'];
    const randomElement = norseEnglishNames['randomElement'](testArray);

    expect(testArray).toContain(randomElement);
  });

  // Test randomInt utility function
  it('should return a random integer within the specified range', () => {
    const min = 1;
    const max = 5;
    const randomInt = norseEnglishNames['randomInt'](min, max);

    expect(randomInt).toBeGreaterThanOrEqual(min);
    expect(randomInt).toBeLessThanOrEqual(max);
  });

  // Test capitalize utility function
  it('should capitalize the first letter of a string', () => {
    const lowerCaseStr = 'test';
    const capitalizedStr = norseEnglishNames['capitalize'](lowerCaseStr);

    expect(capitalizedStr).toBe('Test');
  });
});
