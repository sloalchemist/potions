import { SeededRNG } from './seededRng';
import { createNoise2D } from 'simplex-noise';

const seed = 4;
const rng = new SeededRNG(seed);
console.log(rng.random());
const noise2D = createNoise2D(() => rng.random());

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function generateWorldTiles() {
  const noiseValues = [];
  const width = 50;
  const height = 50;

  let noises = 0;
  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let noiseValue =
        noise2D(x / 20, y / 20) +
        Math.max(0, noise2D(x / 100, y / 100)) +
        noise2D(x / 60, y / 60) -
        distance(x, y, width / 2, height / 2) / 50;
      // if near boundary

      const boundary = Math.min(x, y, width - x - 1, height - y - 1);
      if (boundary < 5) {
        noiseValue -= (5 - boundary) * 0.4;
      }
      noises += noiseValue;

      row.push(noiseValue);
    }
    noiseValues.push(row);
  }

  const tiles = [];

  let averageNoiseValue = noises / (width * height);

  for (let y = 0; y < height; y++) {
    const row = [];
    for (let x = 0; x < width; x++) {
      let noiseValue = noiseValues[x][y];
      let tileType;
      if (noiseValue < averageNoiseValue) {
        tileType = -1;
      } else if (noiseValue > 0.65) {
        tileType = 51;
      } else if (noiseValue > averageNoiseValue + 0.5) {
        tileType = 1;
      } else {
        tileType = 2;
      }
      row.push(tileType);
    }
    tiles.push(row);
  }
  console.log('Noises', noises, noises / (width * height));
  return tiles;
}

const tiles = generateWorldTiles();
tiles[17][19] = 7;
console.log(__dirname);
