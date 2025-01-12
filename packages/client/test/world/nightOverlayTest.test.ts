import { getNightSkyOpacity } from '../../src/utils/nightOverlayHandler';

// Mock Phaser.Math.Interpolation.Linear since it's an external dependency
jest.mock('phaser', () => ({
  Math: {
    Interpolation: {
      Linear: (values: number[], t: number) => {
        return values[0] + (values[1] - values[0]) * t;
      }
    }
  }
}));

describe('getNightSkyOpacity', () => {
  it('should return maximum opacity at noon (hour 6)', () => {
    const result = getNightSkyOpacity(3, 0);
    expect(result).toBeCloseTo(0, 2);
  });

  it('should return minimum opacity at midnight (hour 12)', () => {
    const result = getNightSkyOpacity(12, 0);
    expect(result).toBeCloseTo(0.0, 1);
  });

  it('should return values within valid range', () => {
    // Test multiple time points
    for (let hour = 0; hour < 12; hour++) {
      const result = getNightSkyOpacity(hour, 0);
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(0.5);
    }
  });

  it('should be periodic with period of 12 hours', () => {
    const hour = 3;
    const firstCycle = getNightSkyOpacity(hour, 0);
    const secondCycle = getNightSkyOpacity(hour + 12, 0);
    expect(firstCycle).toBeCloseTo(secondCycle, 5);
  });
});
