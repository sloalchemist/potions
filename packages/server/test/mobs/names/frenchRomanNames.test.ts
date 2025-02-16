import { FrenchRomanNames } from '../../../src/mobs/names/frenchRomanNames';

describe('FrenchRomanNames', () => {
  let frenchRomanNames: FrenchRomanNames;

  beforeEach(() => {
    frenchRomanNames = new FrenchRomanNames();
  });

  // Test for generateName method
  it('should generate a valid name with random prefix and suffix', () => {
    const name = frenchRomanNames.generateName();

    // Valid prefixes (French & Roman)
    const validPrefix = [
      'Aurelius',
      'Claudius',
      'Flavius',
      'Julius',
      'Lucius',
      'Marcus',
      'Octavius',
      'Quintus',
      'Tiberius',
      'Valerius',
      'Beau',
      'Chateau',
      'Fleur',
      'Jardin',
      'Lumiere',
      'Mont',
      'Riviere',
      'Val',
      'Vigne'
    ];

    // Valid suffixes (French & Roman)
    const validSuffix = [
      'us',
      'ium',
      'ianus',
      'ensis',
      'or',
      'ar',
      'ax',
      'ius',
      'ae',
      'a',
      'mont',
      'ville',
      'fort',
      'chateau',
      'lac',
      'terre',
      'bois',
      'plaine',
      'roc',
      'vallee'
    ];

    // Ensure that the prefix and suffix in the generated name are valid
    expect(validPrefix.some((prefix) => name.startsWith(prefix))).toBe(true);
    expect(validSuffix.some((suffix) => name.endsWith(suffix))).toBe(true);
  });

  it('should generate names with a mix of Roman and French prefixes and suffixes', () => {
    const name = frenchRomanNames.generateName();

    // Check for prefix type
    const isRomanPrefix =
      name.startsWith('Aurelius') ||
      name.startsWith('Claudius') ||
      name.startsWith('Flavius') ||
      name.startsWith('Julius') ||
      name.startsWith('Lucius') ||
      name.startsWith('Marcus') ||
      name.startsWith('Octavius') ||
      name.startsWith('Quintus') ||
      name.startsWith('Tiberius') ||
      name.startsWith('Valerius');
    const isFrenchPrefix =
      name.startsWith('Beau') ||
      name.startsWith('Chateau') ||
      name.startsWith('Fleur') ||
      name.startsWith('Jardin') ||
      name.startsWith('Lumiere') ||
      name.startsWith('Mont') ||
      name.startsWith('Riviere') ||
      name.startsWith('Val') ||
      name.startsWith('Vigne');

    const isRomanSuffix =
      name.endsWith('us') ||
      name.endsWith('ium') ||
      name.endsWith('ianus') ||
      name.endsWith('ensis') ||
      name.endsWith('or') ||
      name.endsWith('ar') ||
      name.endsWith('ax') ||
      name.endsWith('ius') ||
      name.endsWith('ae') ||
      name.endsWith('a');

    const isFrenchSuffix =
      name.endsWith('mont') ||
      name.endsWith('ville') ||
      name.endsWith('fort') ||
      name.endsWith('chateau') ||
      name.endsWith('lac') ||
      name.endsWith('terre') ||
      name.endsWith('bois') ||
      name.endsWith('plaine') ||
      name.endsWith('roc') ||
      name.endsWith('vallee');

    // Test for a random mix of both
    expect(isRomanPrefix || isFrenchPrefix).toBe(true);
    expect(isRomanSuffix || isFrenchSuffix).toBe(true);
  });

  it('should generate a name with the correct number of syllables', () => {
    const minSyllables = 2;
    const maxSyllables = 4;
    const name = frenchRomanNames.generateRandomSyllableName(
      minSyllables,
      maxSyllables
    );

    // Ensure the syllable count is within the specified range
    const syllableCount = name.match(/[aeiouy]/g)?.length || 0;
    expect(syllableCount).toBeGreaterThanOrEqual(minSyllables);
    expect(syllableCount).toBeLessThanOrEqual(maxSyllables);
  });

  // Test for edge case: Testing syllables with minimum and maximum values
  it('should generate a name with the minimum number of syllables (2)', () => {
    const name = frenchRomanNames.generateRandomSyllableName(2, 2); // Ensure exactly 2 syllables
    const syllableCount = name.match(/[aeiouy]/g)?.length || 0;
    expect(syllableCount).toBe(2); // Ensure it generates exactly 2 syllables
  });

  it('should generate a name with the maximum number of syllables (4)', () => {
    const name = frenchRomanNames.generateRandomSyllableName(4, 4); // Ensure exactly 4 syllables
    const syllableCount = name.match(/[aeiouy]/g)?.length || 0;
    expect(syllableCount).toBe(4); // Ensure it generates exactly 4 syllables
  });
});
