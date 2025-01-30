export type Coord = {
  readonly x: number;
  readonly y: number;
};

/**
 * Calculate the Euclidean distance between two coordinates.
 *
 * @param coord1 The first coordinate
 * @param coord2 The second coordinate
 * @returns The Euclidean distance between the two coordinates
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
 * Move the coordinate by x and y step values
 *
 * @param coord The initial coordinate
 * @param x The step value to move in the x direction
 * @param y The step value to move in the y direction
 * @returns The new coordinate after moving
 */
export function step(coord: Coord, x: number, y: number) {
  return { x: coord.x + x, y: coord.y + y };
}

/**
 * Return a new coordinate with each component floored to the nearest integer.
 *
 * @param coord The coordinate to floor
 * @returns A new coordinate with floored x and y values
 */

export function floor(coord: Coord): Coord {
  return { x: Math.floor(coord.x), y: Math.floor(coord.y) };
}

/**
 * Return a new coordinate with each component rounded to the nearest integer.
 *
 * @param coord The coordinate to round
 * @returns A new coordinate with rounded x and y values
 */
export function round(coord: Coord): Coord {
  return { x: Math.round(coord.x), y: Math.round(coord.y) };
}

/**
 * Return a new coordinate with each component rounded up to the nearest integer.
 *
 * @param coord The coordinate to ceil
 * @returns A new coordinate with ceiled x and y values
 */
export function ceiling(coord: Coord): Coord {
  return { x: Math.ceil(coord.x), y: Math.ceil(coord.y) };
}

/**
 * Perform a normalized vector subtraction between two coordinates.
 *
 * This function calculates the difference between two coordinates
 * and normalizes the resulting vector, returning a vector with a
 * magnitude of 1.
 *
 * @param coord1 The first coordinate
 * @param coord2 The second coordinate
 * @returns A new coordinate representing the normalized vector
 *          from coord1 to coord2
 */

export function normalizedSubtraction(coord1: Coord, coord2: Coord): Coord {
  const dx = coord1.x - coord2.x;
  const dy = coord1.y - coord2.y;
  const magnitude = Math.sqrt(dx * dx + dy * dy);

  return { x: dx / magnitude, y: dy / magnitude };
}

/**
 * Add a vector scaled by magnitude to a coordinate.
 *
 * This function takes a coordinate, a vector, and a magnitude as inputs.
 * It first calculates the magnitude of the vector and then scales the
 * vector by the magnitude divided by the vector magnitude. Finally,
 * it adds the scaled vector to the origin coordinate and returns the
 * resulting coordinate.
 *
 * @param coord The coordinate to add the vector to
 * @param vector The vector to add
 * @param magnitude The magnitude to scale the vector by
 * @returns The coordinate after adding the scaled vector
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
 * Get all coordinates within a given radius from a central coordinate.
 *
 * This function calculates all integer coordinates that lie within a 
 * specified radius from a given central coordinate. It floors the central 
 * coordinate and includes all points within the circle defined by the 
 * radius around the floored center.
 *
 * @param coord The central coordinate from which to calculate the radius
 * @param radius The radius within which to find coordinates
 * @returns An array of coordinates that are within the specified radius
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
 * Move along a path and update the position and angle of the entity.
 *
 * This function takes a start position, a path, a speed, and a deltaTime as inputs.
 * It then moves the entity along the path by the specified speed and time, and returns
 * the new position and angle of the entity.
 *
 * The function will follow the path until it has exhausted all points in the path.
 * It will also return the angle of the entity after moving, which can be used to
 * update the entity's sprite.
 *
 * @param start The starting position of the entity
 * @param path The path to follow
 * @param speed The speed at which to move the entity
 * @param deltaTime The amount of time to move the entity
 * @returns The new position and angle of the entity after moving
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
    //console.log(`tick path: ${JSON.stringify(this.path)} position: ${JSON.stringify(this.position)} currentTarget: ${JSON.stringify(this.path[0])}`);
    const currentTarget = path[0];
    const distance = calculateDistance(newPosition, currentTarget);
    angle = calculateAngle(newPosition, currentTarget);

    const velocityX = Math.cos(angle) * speed;
    const velocityY = Math.sin(angle) * speed;

    const distanceToMove = speed * (deltaTime / 1000);
    //console.log('distanceToMove', distanceToMove, distance, this.speed, deltaTime, velocityX, velocityY);
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
