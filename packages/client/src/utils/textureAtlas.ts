// Defines the structure of an individual frame in the atlas
export interface AtlasFrame {
  frame: {
    x: number; // X position of the frame within the texture atlas
    y: number; // Y position of the frame within the texture atlas
    w: number; // Width of the frame
    h: number; // Height of the frame
  };
  rotated?: boolean; // Indicates if the frame is rotated in the atlas
  trimmed?: boolean; // Indicates if the frame has been trimmed (transparent padding removed)
  spriteSourceSize?: {
    x: number; // X position of the sprite within the original image before trimming
    y: number; // Y position of the sprite within the original image before trimming
    w: number; // Width of the sprite before trimming
    h: number; // Height of the sprite before trimming
  };
  sourceSize?: {
    w: number; // The original width of the sprite
    h: number; // The original height of the sprite
  };
  pivot?: {
    x: number; // X position of the pivot point (usually 0.5 for center)
    y: number; // Y position of the pivot point (usually 0.5 for center)
  };
}

// Defines the structure of the "meta" section of the atlas
export interface AtlasMeta {
  app: string; // The application used to generate the atlas (e.g., TexturePacker)
  version: string; // The version of the atlas format
  image: string; // The image file used as the texture
  format: string; // The image format (e.g., RGBA8888)
  size: {
    w: number; // Width of the texture image
    h: number; // Height of the texture image
  };
  scale: string; // Scale of the atlas (usually "1")
  smartupdate?: string; // Optional hash for smart update (used by tools like TexturePacker)
}

// Defines the overall structure of the texture atlas
export interface TextureAtlas {
  frames: {
    [key: string]: AtlasFrame; // The key is the frame name, value is the frame properties
  };
  meta: AtlasMeta; // Meta information about the atlas
}
