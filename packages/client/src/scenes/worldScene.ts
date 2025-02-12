import * as Phaser from 'phaser';
import {
  gameState,
  fantasyDate,
  initializePlayer,
  tick
} from '../world/controller';
import { bindAblyToWorldScene, setupAbly } from '../services/ablySetup';
import { TerrainType } from '@rt-potion/common';
import { Coord } from '@rt-potion/common';
import { publicCharacterId } from '../worldMetadata';
import { PaletteSwapper } from '../sprite/palette_swapper';
import { SpriteHouse } from '../sprite/sprite_house';
import { World } from '../world/world';
import { GRAY } from './pauseScene';
import { publishPlayerPosition } from '../services/playerToServer';
import { getNightSkyOpacity } from '../utils/nightOverlayHandler';
import {
  ItemType,
  parseWorldFromJson,
  WorldDescription
} from '../worldDescription';
import { UxScene } from './uxScene';
import { setGameState } from '../world/controller';
import {
  restoreHealth,
  persistWorldData,
  speedUpCharacter
} from '../utils/developerCheats';
import { buttonStyle, nameButtonHoverStyle } from './loadWorldScene';

export let world: World;
let needsAnimationsLoaded: boolean = true;

export const TILE_SIZE = 32;
export const RESPAWN_DELAY = 3000;

export class WorldScene extends Phaser.Scene {
  worldLayer!: Phaser.Tilemaps.TilemapLayer;
  aboveLayer!: Phaser.Tilemaps.TilemapLayer;
  belowLayer!: Phaser.Tilemaps.TilemapLayer;
  cameraDolly!: Phaser.Geom.Point;
  hero!: Phaser.GameObjects.Sprite;
  itemTypes: Record<string, ItemType> = {};
  itemSource: Record<string, string> = {};
  mobSource: Record<string, string> = {};
  paletteSwapper: PaletteSwapper = PaletteSwapper.getInstance();
  mobShadows: Phaser.GameObjects.Rectangle[] = [];
  nightOverlay!: Phaser.GameObjects.Graphics;
  terrainWidth: number = 0;
  terrainHeight: number = 0;
  nightOpacity: number = 0;
  keys: { [key: string]: boolean } = { w: false, a: false, s: false, d: false };
  prevKeys: { [key: string]: boolean } = {
    w: false,
    a: false,
    s: false,
    d: false
  };
  lastKeyUp = '';

  constructor() {
    super({ key: 'WorldScene' });
  }

  preload() {
    this.load.image('background', 'static/background.png');

    this.load.atlas(
      'global_atlas',
      'static/global.png',
      'static/global-atlas.json'
    );

    this.load.spritesheet('blood', 'static/blood.png', {
      frameWidth: 100,
      frameHeight: 100
    });

    //this.load.json('world_data', currentWorld?.world_tile_map_url);
    this.load.json('global_data', 'static/global.json');
    this.load.json('world_specific_data', 'static/world_specific.json');
  }

  loadAnimations(
    spriteSheet: string,
    atlasName: string,
    metadata: WorldDescription
  ) {
    this.anims.create({
      key: 'blood-splat',
      frames: this.anims.generateFrameNumbers('blood', { start: 1, end: 17 }),
      frameRate: 20,
      repeat: 0
    });

    this.anims.create({
      key: `foam`,
      frames: this.anims.generateFrameNames('global_atlas', {
        start: 1,
        end: 8,
        prefix: `foam-`
        //suffix: '.png'
      }),
      frameRate: 6,
      repeat: -1
    });

    metadata.item_types.forEach((itemType) => {
      //console.log('Adding item', itemType.type);
      this.itemSource[itemType.type] = atlasName;
      this.itemTypes[itemType.type] = itemType;
    });

    metadata.mob_types.forEach((mobType) => {
      //console.log('Adding mob', mobType.type);
      this.mobSource[mobType.type] = atlasName;
      this.anims.create({
        key: `${mobType.type}-walk`,
        frames: this.anims.generateFrameNames(atlasName, {
          start: 1,
          end: 6,
          prefix: `${mobType.type}-walk-`
          //suffix: '.png'
        }),
        frameRate: 5,
        repeat: -1
      });

      this.anims.create({
        key: `${mobType.type}-idle`,
        frames: this.anims.generateFrameNames(atlasName, {
          start: 1,
          end: 4,
          prefix: `${mobType.type}-idle-`
          //suffix: '.png'
        }),
        frameRate: 5,
        repeat: -1
      });
    });
  }

  terrainEquals(a: number, b: number, allEquals: boolean = false) {
    if (a == b) {
      return true;
    }

    if (b === 2 && a === 1) {
      return true;
    }

    if (allEquals && a === 2 && b === 1) {
      return true;
    }

    return false;
  }

  drawTerrainLayer(
    terrainData: number[][],
    terrainNumber: number[],
    loose: boolean,
    callback: (
      x: number,
      y: number,
      type: number,
      up: number,
      down: number,
      left: number,
      right: number
    ) => void
  ) {
    const terrainHeight = terrainData[0].length;
    const terrainWidth = terrainData.length;

    // Iterate over each position in the terrain data
    for (let y = 0; y < terrainHeight; y++) {
      for (let x = 0; x < terrainWidth; x++) {
        const type = terrainData[x][y];
        // Calculate the world position
        const posX = x * TILE_SIZE;
        const posY = y * TILE_SIZE;

        // Skip if empty (type 0)
        if (!terrainNumber.includes(type)) {
          continue;
        }

        // Initialize neighbor flags
        let left = 1;
        let right = 1;
        let up = 1;
        let down = 1;

        // Check left neighbor (x - 1)
        if (x > 0 && this.terrainEquals(terrainData[x - 1][y], type, loose)) {
          left = 0;
        }

        // Check right neighbor (x + 1)
        if (
          x < terrainWidth - 1 &&
          this.terrainEquals(terrainData[x + 1][y], type, loose)
        ) {
          right = 0;
        }

        // Check up neighbor (y - 1)
        if (y > 0 && this.terrainEquals(terrainData[x][y - 1], type, loose)) {
          up = 0;
        }

        // Check down neighbor (y + 1)
        if (
          y < terrainHeight - 1 &&
          this.terrainEquals(terrainData[x][y + 1], type, loose)
        ) {
          down = 0;
        }

        callback(posX, posY, type, up, down, left, right);
      }
    }
  }

  hideWorld() {
    this.nightOverlay.fillStyle(GRAY, 1); // Dark blue with 50% opacity
    this.nightOverlay.fillRect(
      0,
      0,
      this.terrainWidth * TILE_SIZE,
      this.terrainHeight * TILE_SIZE
    );
  }

  create() {
    const globalData = parseWorldFromJson(
      this.cache.json.get('global_data'),
      this.cache.json.get('world_specific_data')
    );

    console.log('setting up world', needsAnimationsLoaded);
    //console.log(this.world_data);
    world = new World();
    world.load(globalData);

    // Load globals
    if (needsAnimationsLoaded) {
      this.loadAnimations('global_sprites', 'global_atlas', globalData);
    }

    // Tile mapping as defined earlier
    const tileMapping = [
      '2-2', // Configuration 0
      '2-3', // Configuration 1
      '2-1', // Configuration 2
      '2-4', // Configuration 3
      '3-2', // Configuration 4
      '3-3', // Configuration 5
      '3-1', // Configuration 6
      '3-4', // Configuration 7
      '1-2', // Configuration 8
      '1-3', // Configuration 9
      '1-1', // Configuration 10
      '1-4', // Configuration 11
      '4-2', // Configuration 12
      '4-3', // Configuration 13
      '4-1', // Configuration 14
      '4-4' // Configuration 15
    ] as const satisfies readonly string[];

    const waterTypes = globalData.terrain_types
      .filter((type) => !type.walkable)
      .map((type) => type.id);
    const landTypes = globalData.terrain_types
      .filter((type) => type.walkable)
      .map((type) => type.id);

    const terrainMap: Record<number, TerrainType> = {};
    for (const terrainType of globalData.terrain_types) {
      terrainMap[terrainType.id] = terrainType;
    }
    console.log('waterTypes', waterTypes, 'landTypes', landTypes);
    // Draw water layer
    this.drawTerrainLayer(
      globalData.tiles,
      waterTypes,
      true,
      (posX, posY, type, up, _down, _left, _right) => {
        this.add
          .sprite(posX, posY + TILE_SIZE, 'global_atlas', terrainMap[type].name)
          .setOrigin(0, 0)
          .setDepth(-0.5);
        //console.log('water', type, posX, posY);
        if (up === 1) {
          const foam = this.add
            .sprite(posX, posY + 16, 'global_atlas')
            .setOrigin(0, 0)
            .setDepth(-0.4);
          foam.anims.play(`foam`);
        }
      }
    );

    // Draw land layer with stone
    this.drawTerrainLayer(
      globalData.tiles,
      landTypes,
      true,
      (posX, posY, type, up, down, left, right) => {
        // Compute the configuration value
        const configuration = (up << 3) | (down << 2) | (left << 1) | right;

        // Get the frame index from the mapping
        const frameIndex = tileMapping[configuration];

        // Create the sprite
        //this.add.sprite(posY, posX, 'world_atlas', `sand-2-2`).setOrigin(0, 0).setDepth(-0.5);
        this.add
          .sprite(posX, posY, 'global_atlas', `stone-${frameIndex}`)
          .setOrigin(0, 0)
          .setDepth(-0.3);
      }
    );

    this.drawTerrainLayer(
      globalData.tiles,
      landTypes,
      false,
      (posX, posY, type, up, down, left, right) => {
        const terrain = terrainMap[type].name;
        const configuration = (up << 3) | (down << 2) | (left << 1) | right;

        // Get the frame index from the mapping
        const frameIndex = tileMapping[configuration];

        // Create the sprite
        //this.add.sprite(posY, posX, 'world_atlas', `sand-2-2`).setOrigin(0, 0).setDepth(-0.5);
        this.add
          .sprite(posX, posY, 'global_atlas', `${terrain}-${frameIndex}`)
          .setOrigin(0, 0)
          .setDepth(0);
      }
    );

    // Dimensions for the viewport of the game world. These numbers were derived
    // from packages\client\static\frame.png so that the viewport is entirely
    // within the upper half of the frame.
    const cameraViewportX = 17;
    const cameraViewportY = 16;
    const cameraViewportWidth = this.game.scale.width - 32;
    const cameraViewportHeight = this.game.scale.height * 0.5 - 14;
    this.cameras.main.setViewport(
      cameraViewportX,
      cameraViewportY,
      cameraViewportWidth,
      cameraViewportHeight
    );

    this.terrainWidth = globalData.tiles[0].length;
    this.terrainHeight = globalData.tiles.length;

    const background = this.add.image(0, 0, 'background');
    background.setOrigin(0, 0);
    background.setScrollFactor(0); // Make it stay static
    background.setDisplaySize(this.game.scale.width, this.game.scale.width);
    background.setDepth(-10);

    // Create a night overlay with lower depth
    this.nightOverlay = this.add.graphics();
    this.nightOverlay.fillRect(
      0,
      0,
      this.terrainHeight * TILE_SIZE,
      this.terrainWidth * TILE_SIZE
    );
    this.nightOverlay.setDepth(1000); // Set a low depth, so it's below the speech bubbles
    this.hideWorld();

    bindAblyToWorldScene(this);
    initializePlayer();

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (!world.mobs[publicCharacterId]) {
        return;
      }

      // Check if mouse click is within the viewport of the game world for
      // player movement to occur
      if (
        pointer.x >= cameraViewportX &&
        pointer.x <= cameraViewportX + cameraViewportWidth &&
        pointer.y >= cameraViewportY &&
        pointer.y <= cameraViewportY + cameraViewportHeight
      ) {
        console.log(
          'click',
          pointer.worldX / TILE_SIZE,
          pointer.worldY / TILE_SIZE
        );

        publishPlayerPosition({
          x: pointer.worldX / TILE_SIZE,
          y: pointer.worldY / TILE_SIZE
        });
      }
    });

    const movementKeys = ['w', 'a', 's', 'd'];

    this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!world.mobs[publicCharacterId]) {
        return;
      }

      const curKey = event.key.toLowerCase();
      if (movementKeys.includes(curKey)) {
        this.keys[curKey] = true;
        this.lastKeyUp = curKey;
      }

      if (event.shiftKey && event.code === 'KeyF') {
        speedUpCharacter();
      }
      if (event.shiftKey && event.code === 'KeyH') {
        restoreHealth();
      }
      if (event.shiftKey && event.code === 'KeyS') {
        persistWorldData();
      }
      // Brings up chat box for user
      if (event.code === 'Slash') {
        if (!this.scene.isActive('ChatOverlayScene')) {
          this.scene.launch('ChatOverlayScene');
        }
      }
      // Ends chat box for user
      if (event.code === 'Escape') {
        if (this.scene.isActive('ChatOverlayScene')) {
          this.scene.stop('ChatOverlayScene');
        }
      }
    });

    this.input.keyboard?.on('keyup', (event: KeyboardEvent) => {
      const curKey = event.key.toLowerCase();
      if (movementKeys.includes(curKey)) {
        this.keys[curKey] = false;
        this.lastKeyUp = curKey;
      }
    });

    needsAnimationsLoaded = false;
  }

  public convertToTileXY(pos: Coord): [number, number] {
    return [Math.floor(pos.x / TILE_SIZE), pos.y / TILE_SIZE];
  }

  public convertToWorldXY(pos: Coord): [number, number] {
    return [
      pos.x * TILE_SIZE + TILE_SIZE * 0.5,
      pos.y * TILE_SIZE + TILE_SIZE * 0.5
    ];
  }

  public follow(sprite: Phaser.GameObjects.Sprite) {
    this.cameraDolly = new Phaser.Geom.Point(sprite.x, sprite.y);
    this.cameras.main.startFollow(this.cameraDolly);
    this.hero = sprite;
  }

  count = 0;
  update() {
    if (gameState !== 'stateInitialized') {
      this.hideWorld();
      return;
    }
    tick(this);
    if (this.cameraDolly && this.hero) {
      this.cameraDolly.x = Math.floor(this.hero.x);
      this.cameraDolly.y = Math.floor(this.hero.y);
    }
    if (this.hero) {
      const [x, y] = this.convertToTileXY({ x: this.hero.x, y: this.hero.y });

      Object.values(world.houses).forEach((house) => {
        const spriteHouse = house as SpriteHouse;
        spriteHouse.animate(Math.floor(x), Math.floor(y));
      });
    }

    if (fantasyDate) {
      // Find new opacity value for the night overlay
      this.nightOpacity = getNightSkyOpacity(
        fantasyDate.time,
        this.nightOpacity
      );

      this.nightOverlay.clear();
      // Dark blue with max 50% opacity
      this.nightOverlay.fillStyle(0x000033, this.nightOpacity);
      this.nightOverlay.fillRect(
        0,
        0,
        this.terrainWidth * TILE_SIZE,
        this.terrainHeight * TILE_SIZE
      );
    }

    if (this.count > 50) {
      this.count = 0;
      this.handlePlayerMovement(true);
    } else {
      this.count++;
      this.handlePlayerMovement(false);
    }
  }

  keyChange() {
    let different = false;
    for (const key in this.keys) {
      if (this.keys[key] !== this.prevKeys[key]) {
        different = true;
        break;
      }
    }
    return different;
  }

  handlePlayerMovement(publish: boolean) {
    const player = world.mobs[publicCharacterId];
    if (!(player && player.position)) {
      return;
    }

    let moveX = player.position.x;
    let moveY = player.position.y;

    let moved = false;
    if (this.keys['w']) {
      moveY--;
      moved = true;
    }
    if (this.keys['s']) {
      moveY++;
      moved = true;
    }
    if (this.keys['a']) {
      moveX--;
      moved = true;
    }
    if (this.keys['d']) {
      moveX++;
      moved = true;
    }

    if (!moved) return;

    let roundedX;
    let roundedY;
    const negKeys = ['w', 'a'];
    if (negKeys.includes(this.lastKeyUp)) {
      roundedX = Math.floor(moveX);
      roundedY = Math.floor(moveY);
    } else {
      roundedX = Math.ceil(moveX);
      roundedY = Math.ceil(moveY);
    }

    const target = { x: roundedX, y: roundedY };

    // NOTE: the code in the 'else' block moves the player on the client side
    //       publishPlayerPosition() calls that code itself, so player will
    //       move on the client side for whichever case
    if (publish) {
      this.prevKeys = { ...this.keys };
      publishPlayerPosition(target);
    } else {
      player.target = target;
      const path = world.generatePath(player.unlocks, player.position!, target);
      player.path = path;
    }
  }

  showGameOver() {
    let uxscene = this.scene.get('UxScene') as UxScene;
    uxscene.chatButtons?.clearButtonOptions();

    const text = this.add.text(75, 140, 'GAME OVER', {
      color: '#FFFFFF',
      fontSize: 60,
      fontStyle: 'bold'
    });
    text.setOrigin(0, 0);
    text.setScrollFactor(0); // Make it stay static
    text.setDepth(100);

    this.time.delayedCall(RESPAWN_DELAY, () => {
      // Add respawn button
      const respawn = this.add.text(90, 200, 'RESPAWN', buttonStyle);
      respawn.setOrigin(0, 0);
      respawn.setScrollFactor(0);
      respawn.setDepth(100);
      respawn.setInteractive({ useHandCursor: true });

      // Hover effects
      respawn.on('pointerover', () => {
        respawn.setStyle(nameButtonHoverStyle);
      });
      respawn.on('pointerout', () => {
        respawn.setStyle(buttonStyle);
      });

      // Respawn button action
      respawn.on('pointerdown', () => {
        this.resetToRespawn();
      });

      // Add menu button
      const menu = this.add.text(290, 200, 'MENU', buttonStyle);
      menu.setOrigin(0, 0);
      menu.setScrollFactor(0);
      menu.setDepth(100);
      menu.setInteractive({ useHandCursor: true });

      // Hover effects
      menu.on('pointerover', () => {
        menu.setStyle(nameButtonHoverStyle);
      });
      menu.on('pointerout', () => {
        menu.setStyle(buttonStyle);
      });

      // Main menu button
      menu.on('pointerdown', () => {
        this.resetToLoadWorldScene();
      });
    });
  }

  /* Stop all scenes related to game play and go back to the LoadWordScene 
     for character custmization and game restart.*/
  resetToLoadWorldScene() {
    setGameState('uninitialized');
    this.scene.stop('BrewScene');
    this.scene.stop('PauseScene');
    this.scene.stop('WorldScene');
    this.scene.stop('UxScene');
    this.scene.stop('FrameScene');
    this.scene.stop('ChatOverlayScene');
    this.scene.start('LoadWorldScene');
  }

  /**
   * Stop the world scene, re-connect to Ably after being disconnected by
   * the server, then restart the world scene
   */
  resetToRespawn() {
    this.scene.stop('WorldScene');

    setupAbly()
      .then(() => {
        this.scene.start('WorldScene');
      })
      .catch((_error) => {
        console.error('Error setting up Ably');
      });
  }
}
