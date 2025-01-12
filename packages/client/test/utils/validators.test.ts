import { parseName } from '../../src/utils/validators';

describe('parseName', () => {
  test('should return valid name when input is valid', () => {
    expect(parseName('Hello')).toBe('Hello');
    expect(parseName('Hello123')).toBe('Hello123');
    expect(parseName('H ello')).toBe('H ello');
    expect(parseName('1234567890')).toBe('1234567890');
  });

  test('should trim whitespace from valid names', () => {
    expect(parseName(' Hello ')).toBe('Hello');
    expect(parseName('Hello ')).toBe('Hello');
    expect(parseName(' Hello')).toBe('Hello');
    expect(parseName('\nHello\n')).toBe('Hello');
  });

  test('should return null for empty strings', () => {
    expect(parseName('')).toBeNull();
    expect(parseName(' ')).toBeNull();
    expect(parseName('\n')).toBeNull();
  });

  test('should return null for names longer than 10 characters', () => {
    expect(parseName('12345678901')).toBeNull();
    expect(parseName('HelloWorldLongName')).toBeNull();
  });

  test('should trim before checking length', () => {
    expect(parseName('                Hello')).toBe('Hello');
  });
});
