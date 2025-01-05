import {
  addVectorAndMagnitude,
  calculateDistance,
  equals,
  floor,
  followPath,
  getCoordinatesWithinRadius,
  normalizedSubtraction
} from '../src/coord';

describe('Coord', () => {
  test('constructor initializes coordinates', () => {
    const coord = { x: 3, y: 4 };
    expect(coord.x).toBe(3);
    expect(coord.y).toBe(4);
  });

  test('calculateDistance calculates correct distance', () => {
    const coord1 = { x: 0, y: 0 };
    const coord2 = { x: 3, y: 4 };
    expect(calculateDistance(coord1, coord2)).toBe(5);
  });

  test('calculateDistance calculates correct distance when same coordinates', () => {
    const coord1 = { x: 3, y: 4 };
    const coord2 = { x: 3, y: 4 };
    expect(calculateDistance(coord1, coord2)).toBe(0);
  });

  test('floor returns floored coordinates', () => {
    const coord = { x: 3.6, y: 4.9 };
    expect(floor(coord)).toEqual({ x: 3, y: 4 });
  });

  test('normalizedSubtraction calculates correct normalized vector', () => {
    const coord1 = { x: 3, y: 4 };
    const coord2 = { x: 0, y: 0 };
    const result = normalizedSubtraction(coord1, coord2);
    expect(result.x).toBeCloseTo(0.6);
    expect(result.y).toBeCloseTo(0.8);
  });

  test('addVectorAndMagnitude adds vector scaled by magnitude', () => {
    const coord = { x: 0, y: 0 };
    const vector = { x: 3, y: 4 };
    const result = addVectorAndMagnitude(coord, vector, 10);
    expect(result.x).toBeCloseTo(6);
    expect(result.y).toBeCloseTo(8);
  });

  test('getCoordinatesWithinRadius returns correct coordinates for radius 2', () => {
    const coord = { x: 0, y: 0 };
    const result = getCoordinatesWithinRadius(coord, 2);

    // Expected points within radius 2
    const expected = [
      { x: -2, y: 0 },
      { x: -1, y: -1 },
      { x: -1, y: 0 },
      { x: -1, y: 1 },
      { x: 0, y: -2 },
      { x: 0, y: -1 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: -1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 }
    ];

    expect(result).toEqual(expect.arrayContaining(expected));
    expect(result.length).toBe(expected.length);
  });

  test('followPath follows path correctly', () => {
    const start = { x: 0, y: 0 };
    const path = [{ x: 3, y: 4 }];
    const speed = 5;
    const deltaTime = 1000;

    const [newPosition, angle] = followPath(start, path, speed, deltaTime);

    expect(newPosition.x).toBeCloseTo(3);
    expect(newPosition.y).toBeCloseTo(4);
    expect(angle).toBeCloseTo(Math.atan2(4, 3));
  });

  test('followPath follows a longer path correctly', () => {
    const start = { x: 0, y: 0 };
    const path = [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 9, y: 12 }
    ];
    const speed = 1; // units per second
    const deltaTime = 2000; // milliseconds

    const [newPosition, angle] = followPath(start, path, speed, deltaTime);

    // Expected result after following the first step completely
    expect(newPosition.x).toBeCloseTo(1);
    expect(newPosition.y).toBeCloseTo(1);
    expect(angle).toBeCloseTo(Math.atan2(11, 8));

    // Ensure the path has been updated to the remaining steps
    expect(path.length).toBe(1);
    expect(path[0].x).toBe(9);
    expect(path[0].y).toBe(12);
  });

  test('equals checks for coordinate equality', () => {
    const coord1 = { x: 3, y: 4 };
    const coord2 = { x: 3, y: 4 };
    const coord3 = { x: 4, y: 5 };

    expect(equals(coord1, coord2)).toBe(true);
    expect(equals(coord1, coord3)).toBe(false);
  });
});
