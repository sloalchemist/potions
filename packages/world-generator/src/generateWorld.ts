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
      //console.log('Tile', x, y, tileType);
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
/*
const terrainTypes: TerrainType[] = [
    {
        name: "Dirt",
        id: 2,
        spritesheet_offset: 2,
        walkable: true
    },
    {
        name: "Grass",
        id: 1,
        spritesheet_offset: 0,
        walkable: true
    },
    {
        name: "Water",
        id: 51,
        spritesheet_offset: 1,
        walkable: false
    },
    {
        name: "Tree",
        id: 7,
        spritesheet_offset: 1,
        walkable: false
    },
]

const itemTypes: ItemType[] = [
    {
        name: "Heartbeet",
        type: 'heart-beet',
        attributes: [],
        walkable: true,
        smashable: true,
        interactions: [
            {
                description: 'Brew red potion',
                action: 'brew',
                while_carried: true,
                requires_item: 'cauldron'
            },
            {
                description: 'Eat',
                action: 'eat',
                while_carried: true
            }
        ],
        carryable: true,
        on_tick: []
    }
]

const mobTypes: MobType[] = [
    {
        name: "Blob",
        type: 'blob'
    },
    {
        name: "Villager",
        type: 'villager'
    }
]

const worldDescription: WorldDescription = {
    tiles: tiles,
    terrain_types: terrainTypes,
    item_types: itemTypes,
    mob_types: mobTypes
};



fs.writeFileSync('./output/world-2.json', JSON.stringify(worldDescription));


const atlasData: TextureAtlas = {
    frames: {
        "heart-beet": {
            frame: { x: 16*3, y: 0, w: 16, h: 16 }
        },
        "heart-beet-picked-up": {
            frame: { x: 16*4, y: 0, w: 16, h: 16 }
        },
        "flower-decoration": {
            frame: { x: 16*6, y: 0, w: 16, h: 16 }
        },
        "blob-walk-1": {
            frame: { x: 0, y: 16*1, w: 16, h: 16 }
        },
        "blob-walk-2": {
            frame: { x: 16*1, y: 16*1, w: 16, h: 16 }
        },
        "blob-walk-3": {
            frame: { x: 16*2, y: 16*1, w: 16, h: 16 }
        },
        "blob-idle-1": {
            frame: { x: 0, y: 16*1, w: 16, h: 16 }
        },
        "blob-idle-2": {
            frame: { x: 16*1, y: 16*1, w: 16, h: 16 }
        },
        "tree-overlay": {
            frame: { x: 0, y: 16*2, w: 16*4, h: 16*4 }
        },
        "grass-1-1": {
            frame: { x: 0, y: 96, w: 32, h: 32 }
        },
        "grass-1-2": {
            frame: { x: 32, y: 96, w: 32, h: 32 }
        },
        "grass-1-3": {
            frame: { x: 64, y: 96, w: 32, h: 32 }
        },
        "grass-1-4": {
            frame: { x: 96, y: 96, w: 32, h: 32 }
        },
        "grass-2-1": {
            frame: { x: 0, y: 128, w: 32, h: 32 }
        },
        "grass-2-2": {
            frame: { x: 32, y: 128, w: 32, h: 32 }
        },
        "grass-2-3": {
            frame: { x: 64, y: 128, w: 32, h: 32 }
        },
        "grass-2-4": {
            frame: { x: 96, y: 128, w: 32, h: 32 }
        },
        "grass-3-1": {
            frame: { x: 0, y: 160, w: 32, h: 32 }
        },
        "grass-3-2": {
            frame: { x: 32, y: 160, w: 32, h: 32 }
        },
        "grass-3-3": {
            frame: { x: 64, y: 160, w: 32, h: 32 }
        },
        "grass-3-4": {
            frame: { x: 96, y: 160, w: 32, h: 32 }
        },
        "grass-4-1": {
            frame: { x: 0, y: 192, w: 32, h: 32 }
        },
        "grass-4-2": {
            frame: { x: 32, y: 192, w: 32, h: 32 }
        },
        "grass-4-3": {
            frame: { x: 64, y: 192, w: 32, h: 32 }
        },
        "grass-4-4": {
            frame: { x: 96, y: 192, w: 32, h: 32 }
        },
        "sand-1-1": {
            frame: { x: 160, y: 96, w: 32, h: 32 }
        },
        "sand-1-2": {
            frame: { x: 192, y: 96, w: 32, h: 32 }
        },
        "sand-1-3": {
            frame: { x: 224, y: 96, w: 32, h: 32 }
        },
        "sand-1-4": {
            frame: { x: 256, y: 96, w: 32, h: 32 }
        },
        "sand-2-1": {
            frame: { x: 160, y: 128, w: 32, h: 32 }
        },
        "sand-2-2": {
            frame: { x: 192, y: 128, w: 32, h: 32 }
        },
        "sand-2-3": {
            frame: { x: 224, y: 128, w: 32, h: 32 }
        },
        "sand-2-4": {
            frame: { x: 256, y: 128, w: 32, h: 32 }
        },
        "sand-3-1": {
            frame: { x: 160, y: 160, w: 32, h: 32 }
        },
        "sand-3-2": {
            frame: { x: 192, y: 160, w: 32, h: 32 }
        },
        "sand-3-3": {
            frame: { x: 224, y: 160, w: 32, h: 32 }
        },
        "sand-3-4": {
            frame: { x: 256, y: 160, w: 32, h: 32 }
        },
        "sand-4-1": {
            frame: { x: 160, y: 192, w: 32, h: 32 }
        },
        "sand-4-2": {
            frame: { x: 192, y: 192, w: 32, h: 32 }
        },
        "sand-4-3": {
            frame: { x: 224, y: 192, w: 32, h: 32 }
        },
        "sand-4-4": {
            frame: { x: 256, y: 192, w: 32, h: 32 }
        },
        "water": {
            frame: { x: 0, y: 224, w: 32, h: 32 }
        },
        "foam-1-1-1": {
            frame: { x: 0, y: 288, w: 32, h: 32 }
        },
        "foam-1-2-1": {
            frame: { x: 32, y: 288, w: 32, h: 32 }
        },
        "foam-1-3-1": {
            frame: { x: 64, y: 288, w: 32, h: 32 }
        },
        "foam-2-1-1": {
            frame: { x: 0, y: 320, w: 32, h: 32 }
        },
        "foam-2-2-1": {
            frame: { x: 32, y: 320, w: 32, h: 32 }
        },
        "foam-2-3-1": {
            frame: { x: 32, y: 320, w: 32, h: 32 }
        },
        "foam-3-1-1": {
            frame: { x: 0, y: 352, w: 32, h: 32 }
        },
        "foam-3-2-1": {
            frame: { x: 32, y: 352, w: 32, h: 32 }
        },
        "foam-3-3-1": {
            frame: { x: 64, y: 352, w: 32, h: 32 }
        },
        "foam-1-1-2": {
            frame: { x: 96, y: 288, w: 32, h: 32 }
        },
        "foam-1-2-2": {
            frame: { x: 128, y: 288, w: 32, h: 32 }
        },
        "foam-1-3-2": {
            frame: { x: 160, y: 288, w: 32, h: 32 }
        },
        "foam-2-1-2": {
            frame: { x: 96, y: 320, w: 32, h: 32 }
        },
        "foam-2-2-2": {
            frame: { x: 128, y: 320, w: 32, h: 32 }
        },
        "foam-2-3-2": {
            frame: { x: 160, y: 320, w: 32, h: 32 }
        },
        "foam-3-1-2": {
            frame: { x: 96, y: 352, w: 32, h: 32 }
        },
        "foam-3-2-2": {
            frame: { x: 128, y: 352, w: 32, h: 32 }
        },
        "foam-3-3-2": {
            frame: { x: 160, y: 352, w: 32, h: 32 }
        },
        "foam-1-1-3": {
            frame: { x: 192, y: 288, w: 32, h: 32 }
        },
        "foam-1-2-3": {
            frame: { x: 224, y: 288, w: 32, h: 32 }
        },
        "foam-1-3-3": {
            frame: { x: 256, y: 288, w: 32, h: 32 }
        },
        "foam-2-1-3": {
            frame: { x: 192, y: 320, w: 32, h: 32 }
        },
        "foam-2-2-3": {
            frame: { x: 224, y: 320, w: 32, h: 32 }
        },
        "foam-2-3-3": {
            frame: { x: 256, y: 320, w: 32, h: 32 }
        },
        "foam-3-1-3": {
            frame: { x: 192, y: 352, w: 32, h: 32 }
        },
        "foam-3-2-3": {
            frame: { x: 224, y: 352, w: 32, h: 32 }
        },
        "foam-3-3-3": {
            frame: { x: 256, y: 352, w: 32, h: 32 }
        },
        "foam-1-1-4": {
            frame: { x: 288, y: 288, w: 32, h: 32 }
        },
        "foam-1-2-4": {
            frame: { x: 320, y: 288, w: 32, h: 32 }
        },
        "foam-1-3-4": {
            frame: { x: 352, y: 288, w: 32, h: 32 }
        },
        "foam-2-1-4": {
            frame: { x: 288, y: 320, w: 32, h: 32 }
        },
        "foam-2-2-4": {
            frame: { x: 320, y: 320, w: 32, h: 32 }
        },
        "foam-2-3-4": {
            frame: { x: 352, y: 320, w: 32, h: 32 }
        },
        "foam-3-1-4": {
            frame: { x: 288, y: 352, w: 32, h: 32 }
        },
        "foam-3-2-4": {
            frame: { x: 320, y: 352, w: 32, h: 32 }
        },
        "foam-3-3-4": {
            frame: { x: 352, y: 352, w: 32, h: 32 }
        },
        "foam-1-1-5": {
            frame: { x: 384, y: 288, w: 32, h: 32 }
        },
        "foam-1-2-5": {
            frame: { x: 416, y: 288, w: 32, h: 32 }
        },
        "foam-1-3-5": {
            frame: { x: 448, y: 288, w: 32, h: 32 }
        },
        "foam-2-1-5": {
            frame: { x: 384, y: 320, w: 32, h: 32 }
        },
        "foam-2-2-5": {
            frame: { x: 416, y: 320, w: 32, h: 32 }
        },
        "foam-2-3-5": {
            frame: { x: 448, y: 320, w: 32, h: 32 }
        },
        "foam-3-1-5": {
            frame: { x: 384, y: 352, w: 32, h: 32 }
        },
        "foam-3-2-5": {
            frame: { x: 416, y: 352, w: 32, h: 32 }
        },
        "foam-3-3-5": {
            frame: { x: 448, y: 352, w: 32, h: 32 }
        },
        "foam-1-1-6": {
            frame: { x: 0, y: 384, w: 32, h: 32 }
        },
        "foam-1-2-6": {
            frame: { x: 32, y: 384, w: 32, h: 32 }
        },
        "foam-1-3-6": {
            frame: { x: 64, y: 384, w: 32, h: 32 }
        },
        "foam-2-1-6": {
            frame: { x: 0, y: 416, w: 32, h: 32 }
        },
        "foam-2-2-6": {
            frame: { x: 32, y: 416, w: 32, h: 32 }
        },
        "foam-2-3-6": {
            frame: { x: 64, y: 416, w: 32, h: 32 }
        },
        "foam-3-1-6": {
            frame: { x: 0, y: 448, w: 32, h: 32 }
        },
        "foam-3-2-6": {
            frame: { x: 32, y: 448, w: 32, h: 32 }
        },
        "foam-3-3-6": {
            frame: { x: 64, y: 448, w: 32, h: 32 }
        },
        "foam-1-1-7": {
            frame: { x: 96, y: 384, w: 32, h: 32 }
        },
        "foam-1-2-7": {
            frame: { x: 128, y: 384, w: 32, h: 32 }
        },
        "foam-1-3-7": {
            frame: { x: 160, y: 384, w: 32, h: 32 }
        },
        "foam-2-1-7": {
            frame: { x: 96, y: 416, w: 32, h: 32 }
        },
        "foam-2-2-7": {
            frame: { x: 128, y: 416, w: 32, h: 32 }
        },
        "foam-2-3-7": {
            frame: { x: 160, y: 416, w: 32, h: 32 }
        },
        "foam-3-1-7": {
            frame: { x: 96, y: 448, w: 32, h: 32 }
        },
        "foam-3-2-7": {
            frame: { x: 128, y: 448, w: 32, h: 32 }
        },
        "foam-3-3-7": {
            frame: { x: 160, y: 448, w: 32, h: 32 }
        },
        "foam-1-1-8": {
            frame: { x: 192, y: 384, w: 32, h: 32 }
        },
        "foam-1-2-8": {
            frame: { x: 224, y: 384, w: 32, h: 32 }
        },
        "foam-1-3-8": {
            frame: { x: 256, y: 384, w: 32, h: 32 }
        },
        "foam-2-1-8": {
            frame: { x: 192, y: 416, w: 32, h: 32 }
        },
        "foam-2-2-8": {
            frame: { x: 224, y: 416, w: 32, h: 32 }
        },
        "foam-2-3-8": {
            frame: { x: 256, y: 416, w: 32, h: 32 }
        },
        "foam-3-1-8": {
            frame: { x: 192, y: 448, w: 32, h: 32 }
        },
        "foam-3-2-8": {
            frame: { x: 224, y: 448, w: 32, h: 32 }
        },
        "foam-3-3-8": {
            frame: { x: 256, y: 448, w: 32, h: 32 }
        },
        "villager-walk-1": {
            "frame": {
                "x": 0,
                "y": 480,
                "w": 32,
                "h": 32
            }
        },
        "villager-walk-2": {
            "frame": {
                "x": 32,
                "y": 480,
                "w": 32,
                "h": 32
            }
        },
        "villager-walk-3": {
            "frame": {
                "x": 64,
                "y": 480,
                "w": 32,
                "h": 32
            }
        },
        "villager-walk-4": {
            "frame": {
                "x": 96,
                "y": 480,
                "w": 32,
                "h": 32
            }
        },
        "villager-walk-5": {
            "frame": {
                "x": 128,
                "y": 480,
                "w": 32,
                "h": 32
            }
        },
        "villager-walk-6": {
            "frame": {
                "x": 160,
                "y": 480,
                "w": 32,
                "h": 32
            }
        },
        "villager-idle-1": {
            "frame": {
                "x": 0,
                "y": 512,
                "w": 32,
                "h": 32
            }
        },
        "villager-idle-2": {
            "frame": {
                "x": 32,
                "y": 512,
                "w": 32,
                "h": 32
            }
        },
        "villager-idle-3": {
            "frame": {
                "x": 64,
                "y": 512,
                "w": 32,
                "h": 32
            }
        },
        "villager-idle-4": {
            "frame": {
                "x": 96,
                "y": 512,
                "w": 32,
                "h": 32
            }
        },
    },
    meta: {
        app: "https://www.codeandweb.com/texturepacker",
        version: "1.0",
        image: "world-2-tileset.png",
        format: "RGBA8888",
        size: { w: 128, h: 128 },
        scale: "1"
    }
};

fs.writeFileSync('./output/world-2-texture-atlas.json', JSON.stringify(atlasData));
*/
