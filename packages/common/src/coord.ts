export type Coord = {
  readonly x: number;
  readonly y: number;
};

/**
 * Calculates the distance between two coordinates.
 * @param {Coord} coord1 - The first coordinate.
 * @param {Coord} coord2 - The second coordinate.
 * @returns {number} The distance between the two coordinates.
 */
export function calculateDistance(coord1: Coord, coord2: Coord) {
  const dx = coord2.x - coord1.x;
  const dy = coord2.y - coord1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate the angle in radians between two coordinates.
 *
 * The angle is measured with respect to the positive x-axis, in the range [-π, π].
 *
 * @param coord1 The first coordinate (origin)
 * @param coord2 The second coordinate (target)
 * @returns The angle in radians between the two coordinates
 */

function calculateAngle(coord1: Coord, coord2: Coord) {
  const dx = coord2.x - coord1.x;
  const dy = coord2.y - coord1.y;

  return Math.atan2(dy, dx);
}

/**
 * Moves the coordinate by x and y step values.
 * @param {Coord} coord - The coordinate to move.
 * @param {number} x - The x step value.
 * @param {number} y - The y step value.
 * @returns {Coord} The new coordinate after moving.
 */
// Move the coordinate by x and y step values
export function step(coord: Coord, x: number, y: number) {
  return { x: coord.x + x, y: coord.y + y };
}

/**
 * Floors the x and y values of a coordinate.
 * @param {Coord} coord - The coordinate to floor.
 * @returns {Coord} The floored coordinate.
 */
// Return the floor values of the coordinates
export function floor(coord: Coord): Coord {
  return { x: Math.floor(coord.x), y: Math.floor(coord.y) };
}

/**
 * Rounds the x and y values of a coordinate.
 * @param {Coord} coord - The coordinate to round.
 * @returns {Coord} The rounded coordinate.
 */
// Return the rounded values of the coordinates
export function round(coord: Coord): Coord {
  return { x: Math.round(coord.x), y: Math.round(coord.y) };
}

/**
 * Ceils the x and y values of a coordinate.
 * @param {Coord} coord - The coordinate to ceil.
 * @returns {Coord} The ceiled coordinate.
 */
// Return the ceiling values of the coordinates
export function ceiling(coord: Coord): Coord {
  return { x: Math.ceil(coord.x), y: Math.ceil(coord.y) };
}

/**
 * Normalized vector subtraction between two coordinates.
 * @param {Coord} coord1 - The first coordinate.
 * @param {Coord} coord2 - The second coordinate.
 * @returns {Coord} The normalized coordinate.
 */
export function normalizedSubtraction(coord1: Coord, coord2: Coord): Coord {
  const dx = coord1.x - coord2.x;
  const dy = coord1.y - coord2.y;
  const magnitude = Math.sqrt(dx * dx + dy * dy);

  return { x: dx / magnitude, y: dy / magnitude };
}

/**
 * Adds a vector and magnitude to a coordinate.
 * @param {Coord} coord - The coordinate.
 * @param {Coord} vector - The vector to add.
 * @param {number} magnitude - The magnitude of the vector.
 * @returns {Coord} The new coordinate.
 */
export function addVectorAndMagnitude(
  coord: Coord,
  vector: Coord,
  magnitude: number
): Coord {
  const vectorMagnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  const scale = magnitude / vectorMagnitude;

  // Scale the vector and add it to the origin coordinate
  return { x: coord.x + vector.x * scale, y: coord.y + vector.y * scale };
}

/**
 * Gets the coordinates within a given radius.
 * @param {Coord} coord - The center coordinate.
 * @param {number} radius - The radius.
 * @returns {Coord[]} The coordinates within the radius.
 */
export function getCoordinatesWithinRadius(
  coord: Coord,
  radius: number
): Coord[] {
  const flooredCoords: Coord[] = [];
  const flooredCenter = floor(coord);
  const radiusSquared = radius * radius;

  for (let x = flooredCenter.x - radius; x <= flooredCenter.x + radius; x++) {
    for (let y = flooredCenter.y - radius; y <= flooredCenter.y + radius; y++) {
      const dx = x - coord.x;
      const dy = y - coord.y;

      if (dx * dx + dy * dy <= radiusSquared) {
        flooredCoords.push({ x, y });
      }
    }
  }

  return flooredCoords;
}

/**
 * Follows a path with a given speed and delta time.
 * @param {Coord} start - The starting coordinate.
 * @param {Coord[]} path - The path to follow.
 * @param {number} speed - The speed of movement.
 * @param {number} deltaTime - The delta time.
 * @returns {[Coord, number]} The new position and angle.
 */
export function followPath(
  start: Coord,
  path: Coord[],
  speed: number,
  deltaTime: number
): [Coord, number] {
  let newPosition = { x: start.x, y: start.y };
  let angle = 0;
  while (path.length > 0) {
    const currentTarget = path[0];
    const distance = calculateDistance(newPosition, currentTarget);
    angle = calculateAngle(newPosition, currentTarget);

    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    const distanceToMove = speed * (deltaTime / 1000);
    if (distanceToMove >= distance) {
      // Move to the current target and remove it from the path
      newPosition = { x: currentTarget.x, y: currentTarget.y };
      path.shift();

      // Update deltaTime to reflect the remaining time after moving to the target
      deltaTime -= (distance / speed) * 1000;
    } else {
      // Move part of the way towards the current target
      newPosition = step(
        newPosition,
        velocityX * (deltaTime / 1000),
        velocityY * (deltaTime / 1000)
      );
      break;
    }
  }

  return [newPosition, angle];
}

/**
 * Check if two coordinates are equal.
 *
 * Compares the x and y values of two coordinates to determine
 * if they are the same.
 *
 * @param coord1 The first coordinate to compare
 * @param coord2 The second coordinate to compare
 * @returns True if the coordinates are equal, false otherwise
 */

export function equals(coord1: Coord, coord2: Coord): boolean {
  return coord1.x === coord2.x && coord1.y === coord2.y;
}
