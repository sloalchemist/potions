export type Coord = {
  readonly x: number;
  readonly y: number;
};

// Calculate the distance between this coordinate and another
export function calculateDistance(coord1: Coord, coord2: Coord) {
  const dx = coord2.x - coord1.x;
  const dy = coord2.y - coord1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Calculate the angle between this coordinate and another
function calculateAngle(coord1: Coord, coord2: Coord) {
  const dx = coord2.x - coord1.x;
  const dy = coord2.y - coord1.y;

  return Math.atan2(dy, dx);
}

// Move the coordinate by x and y step values
export function step(coord: Coord, x: number, y: number) {
  return { x: coord.x + x, y: coord.y + y };
}

// Return the floor values of the coordinates
export function floor(coord: Coord): Coord {
  return { x: Math.floor(coord.x), y: Math.floor(coord.y) };
}

// Return the rounded values of the coordinates
export function round(coord: Coord): Coord {
  return { x: Math.round(coord.x), y: Math.round(coord.y) };
}

// Return the ceiling values of the coordinates
export function ceiling(coord: Coord): Coord {
  return { x: Math.ceil(coord.x), y: Math.ceil(coord.y) };
}

// Normalized vector subtraction between two coordinates
export function normalizedSubtraction(coord1: Coord, coord2: Coord): Coord {
  const dx = coord1.x - coord2.x;
  const dy = coord1.y - coord2.y;
  const magnitude = Math.sqrt(dx * dx + dy * dy);

  return { x: dx / magnitude, y: dy / magnitude };
}

// Convert vector and magnitude into a new coordinate
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

export function equals(coord1: Coord, coord2: Coord): boolean {
  return coord1.x === coord2.x && coord1.y === coord2.y;
}
