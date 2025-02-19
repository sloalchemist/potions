import { hexStringToNumber, darkenColor, numberToHexString, getRandomColor } from '../../src/utils/color';

describe('hexStringToNumber', () => {
  test('should convert hex string to number', () => {
    expect(hexStringToNumber('#ffffff')).toBe(0xffffff);
    expect(hexStringToNumber('ffffff')).toBe(0xffffff);
    expect(hexStringToNumber('#000000')).toBe(0x000000);
    expect(hexStringToNumber('000000')).toBe(0x000000);
  });

  test('should handle invalid hex strings', () => {
    expect(hexStringToNumber('')).toBeNaN();
    expect(hexStringToNumber('zzzzzz')).toBeNaN();
  });
});

describe('darkenColor', () => {
  test('should darken the color by the given percentage', () => {
    expect(darkenColor(0xffffff, 50)).toBe(0x7f7f7f);
    expect(darkenColor(0x000000, 50)).toBe(0x000000);
    expect(darkenColor(0xff0000, 50)).toBe(0x7f0000);
  });

  test('should handle edge cases', () => {
    expect(darkenColor(0xffffff, 0)).toBe(0xffffff);
    expect(darkenColor(0xffffff, 100)).toBe(0x000000);
  });
});

describe('numberToHexString', () => {
  test('should convert number to hex string', () => {
    expect(numberToHexString(0xffffff)).toBe('#ffffff');
    expect(numberToHexString(0x000000)).toBe('#000000');
    expect(numberToHexString(0x123456)).toBe('#123456');
  });

  test('should pad hex string with zeros', () => {
    expect(numberToHexString(0x1)).toBe('#000001');
    expect(numberToHexString(0x123)).toBe('#000123');
  });
});

describe('getRandomColor', () => {
  test('should return a valid color from the predefined list', () => {
    const colors = [
      '#a3f1d8', '#7b2c9f', '#e5a73c', '#4d9bea', '#ff5733', 
      '#2ecc71', '#c70039', '#900c3f', '#f1c40f', '#2980b9', 
      '#8e44ad', '#16a085'
    ];
    const randomColor = getRandomColor();
    expect(colors).toContain(randomColor);
  });
});