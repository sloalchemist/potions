import * as Phaser from 'phaser';
import {
  gameState,
  fantasyDate,
  initializePlayer,
  tick
} from '../world/controller';
import { bindAblyToWorldScene } from '../services/ablySetup';
import { TerrainType } from '@rt-potion/common';
import { Coord } from '@rt-potion/common';
import { publicCharacterId, getWorldID } from '../worldMetadata';
import { PaletteSwapper } from '../sprite/palette_swapper';
import { SpriteHouse } from '../sprite/sprite_house';
import { World } from '../world/world';
import { GRAY } from './pauseScene';
import { publishPlayerPosition } from '../services/playerToServer';
import { getNightSkyOpacity } from '../utils/nightOverlayHandler';
import { interact } from '../services/playerToServer';
import {
  ItemType,
  parseWorldFromJson,
  WorldDescription
} from '../worldDescription';

import { UxScene } from './uxScene';
import { setGameState, setInventoryCallback } from '../world/controller';
import {
  restoreHealth,
  persistWorldData,
  speedUpCharacter
} from '../utils/developerCheats';
import { buttonStyle, nameButtonHoverStyle } from './loadWorldScene';
import { Item } from '../world/item';
import { SpriteItem } from '../sprite/sprite_item';
import { LoadingProgressBar } from '../components/loadingIndicator';

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
  keys: { [key: string]: boolean } = {
    w: false,
    a: false,
    s: false,
    d: false,
    e: false
  };
  prevKeys: { [key: string]: boolean } = {
    w: false,
    a: false,
    s: false,
    d: false,
    e: false
  };
  lastKeyUp = '';
  lastPublishTime: number = 0;
  private loadingBar: LoadingProgressBar;

  constructor() {
    super({ key: 'WorldScene' });
    this.loadingBar = new LoadingProgressBar(this, {
      width: 400,
      height: 40,
      padding: 4,
      barColor: 0x4caf50,
      containerColor: 0x333333,
      verticalOffset: -100,
      depth: 1000,
      textConfig: {
        fontSize: '24px',
        fontStyle: 'bold',
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 }
      },
      loadingText: 'Loading World'
    });
  }

  init() {
    // Initialize graphics before any scene content
    this.nightOverlay = this.add.graphics();
    this.nightOverlay.setDepth(500);
    this.nightOverlay.setScrollFactor(0);
  }

  preload() {
    // Initialize loading bar first
    console.log('Preload started');
    this.loadingBar.create();

    // Register loading bar with scene's update list
    this.events.on('update', () => {
      this.loadingBar.update();
    });

    // Hide world immediately
    this.hideWorld();

    // Set initial progress to show something is happening
    this.loadingBar.setProgress(0.1);
    this.loadingBar.setCurrentFile('Initializing...');
    this.scene.systems.updateList.update();

    this.load.on('filecomplete', (key: string) => {
      this.loadingBar.setCurrentFile(`Loaded: ${key}`);
    });

    // Clean up loading bar when done
    this.load.on('complete', () => {
      this.loadingBar.setProgress(1);
      this.loadingBar.setCurrentFile('Ready!');

      // Wait 500ms to show 100% before destroying
      setTimeout(() => {
        // Remove update listener
        this.events.off('update');
        this.loadingBar.destroy();
      }, 500);
    });

    // Start loading assets
    const worldID = getWorldID();
    this.load.image(
      'background',
      `../../../world_assets/${worldID}/background.png`
    );
    this.load.atlas(
      'global_atlas',
      `../../../world_assets/${worldID}/global.png`,
      `../../../world_assets/${worldID}/global-atlas.json`
    );

    this.load.spritesheet('blood', 'static/blood.png', {
      frameWidth: 100,
      frameHeight: 100
    });

    this.load.spritesheet('explosion', 'static/Explosion-scaled.png', {
      frameWidth: 288,
      frameHeight: 288
    });

    this.load.json('global_data', '../../../world_assets/global.json');
    this.load.json(
      'world_specific_data',
      `../../../world_assets/${worldID}/world_specific.json`
    );
    this.load.audio('background_music_layer', [
      `static/music/${worldID}_layer.mp3`
    ]);
    this.load.audio('background_music', ['static/music/cosmic_ambient.mp3']);
    this.load.audio('walk', ['static/sounds/walk.mp3']);
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
      key: 'bomb-explosion',
      frames: this.anims.generateFrameNumbers('explosion', {
        start: 0,
        end: 11
      }),
      frameRate: 20,
      repeat: 0
    });

    this.anims.create({
      key: `foam`,
      frames: this.anims.generateFrameNames('global_atlas', {
        start: 1,
        end: 8,
        prefix: `foam-`
      }),
      frameRate: 6,
      repeat: -1
    });

    metadata.item_types.forEach((itemType) => {
      this.itemSource[itemType.type] = atlasName;
      this.itemTypes[itemType.type] = itemType;
    });

    metadata.mob_types.forEach((mobType) => {
      this.mobSource[mobType.type] = atlasName;
      this.anims.create({
        key: `${mobType.type}-walk`,
        frames: this.anims.generateFrameNames(atlasName, {
          start: 1,
          end: 6,
          prefix: `${mobType.type}-walk-`
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
    const worldData = parseWorldFromJson(
      this.cache.json.get('global_data'),
      this.cache.json.get('world_specific_data')
    );

    world = new World();
    world.load(worldData);

    setInventoryCallback((items: Item[]) => {
      console.log('Inventory callback called with items:', items);
      const uxScene = this.scene.get('UxScene') as UxScene;
      uxScene.setInventory(items);
    });

    // Load globals
    if (needsAnimationsLoaded) {
      this.loadAnimations('global_sprites', 'global_atlas', worldData);
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

    const waterTypes = worldData.terrain_types
      .filter((type) => !type.walkable)
      .map((type) => type.id);
    const landTypes = worldData.terrain_types
      .filter((type) => type.walkable)
      .map((type) => type.id);

    const terrainMap: Record<number, TerrainType> = {};
    for (const terrainType of worldData.terrain_types) {
      terrainMap[terrainType.id] = terrainType;
    }

    // Draw water layer
    this.drawTerrainLayer(
      worldData.tiles,
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
      worldData.tiles,
      landTypes,
      true,
      (posX, posY, type, up, down, left, right) => {
        // Compute the configuration value
        const configuration = (up << 3) | (down << 2) | (left << 1) | right;

        // Get the frame index from the mapping
        const frameIndex = tileMapping[configuration];

        // Create the sprite
        this.add
          .sprite(posX, posY, 'global_atlas', `stone-${frameIndex}`)
          .setOrigin(0, 0)
          .setDepth(-0.3);
      }
    );

    this.drawTerrainLayer(
      worldData.tiles,
      landTypes,
      false,
      (posX, posY, type, up, down, left, right) => {
        const terrain = terrainMap[type].name;
        const configuration = (up << 3) | (down << 2) | (left << 1) | right;

        // Get the frame index from the mapping
        const frameIndex = tileMapping[configuration];

        // Create the sprite
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

    this.terrainWidth = worldData.tiles[0].length;
    this.terrainHeight = worldData.tiles.length;

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

    if (this.registry.get('music') === true) {
      if (!this.sound.isPlaying('background_music')) {
        this.sound.add('background_music', { loop: true, volume: 0.8 }).play();
      }
      if (!this.sound.isPlaying('background_music_layer')) {
        this.sound
          .add('background_music_layer', { loop: true, volume: 0.3 })
          .play();
      }
    }

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
        // Prevent player movement if the brew scene is active
        if (
          this.scene.isActive('BrewScene') ||
          this.scene.isActive('FightScene')
        ) {
          return;
        }

        // Prevent player movement if the brew scene is active
        if (
          this.scene.isActive('BrewScene') ||
          this.scene.isActive('FightScene')
        ) {
          return;
        }

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

      if (curKey === 'e') {
        const player = world.mobs[publicCharacterId];
        if (player && player.position) {
          if (player.carrying) {
            const carriedItem = world.items[player.carrying];
            if (carriedItem) {
              interact(carriedItem.key, 'drop', null);
            }
          } else {
            const pickupItem = world.getItemAt(
              Math.floor(player.position.x),
              Math.floor(player.position.y)
            );
            if (pickupItem) {
              interact(pickupItem.key, 'pickup', null);
            }
          }
        }
      }

      if (event.shiftKey && event.code === 'KeyF') {
        speedUpCharacter();
      }
      if (event.shiftKey && event.code === 'KeyH') {
        restoreHealth();
      }
      if (event.shiftKey && event.code === 'KeyG') {
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

  update() {
    if (gameState !== 'stateInitialized') {
      this.hideWorld();
      return;
    }
    tick(this);
    if (this.cameraDolly && this.hero) {
      const roundedX = Math.floor(this.hero.x);
      const roundedY = Math.floor(this.hero.y);

      if (roundedX !== this.cameraDolly.x || roundedY !== this.cameraDolly.y) {
        if (
          this.registry.get('soundEffects') === true &&
          !this.sound.isPlaying('walk')
        ) {
          this.sound.add('walk', { loop: true, volume: 0.6 }).play();
        }
      } else {
        this.sound.removeByKey('walk');
      }
      this.cameraDolly.x = roundedX;
      this.cameraDolly.y = roundedY;
    }
    if (this.hero) {
      const [x, y] = this.convertToTileXY({ x: this.hero.x, y: this.hero.y });

      Object.values(world.houses).forEach((house) => {
        const spriteHouse = house as SpriteHouse;
        spriteHouse.animate(Math.floor(x), Math.floor(y));
      });

      Object.values(world.items).forEach((shipwreck) => {
        const ship = shipwreck as SpriteItem;
        const heroX = Math.floor(x);
        const heroY = Math.floor(y);

        // Calculate the width and height in tiles
        const shipWidthTiles = 110 / TILE_SIZE;
        const shipHeightTiles = 115 / TILE_SIZE;

        if (
          ship.itemType.type === 'shipwreck' &&
          heroX > 27 - shipWidthTiles / 2 - 1 &&
          heroX < 27 + shipWidthTiles / 2 &&
          heroY > 28 - shipHeightTiles / 2 &&
          heroY < 28 + shipHeightTiles / 2 - 1
        ) {
          ship.sprite.setAlpha(0.5);
        } else {
          ship.sprite.setAlpha(1);
        }
      });
      Object.values(world.items).forEach((volcano) => {
        const vol = volcano as SpriteItem;
        const heroX = Math.floor(x);
        const heroY = Math.floor(y);

        // Calculate the width and height in tiles
        const volWidthTiles = 238 / TILE_SIZE;
        const volHeightTiles = 204 / TILE_SIZE;

        if (
          vol.itemType.type === 'volcano' &&
          heroX > 16 - volWidthTiles / 2 - 1 &&
          heroX <= 16 + volWidthTiles / 2 + 1 &&
          heroY > 24 - volHeightTiles / 2 &&
          heroY <= 24 + volHeightTiles / 2
        ) {
          vol.sprite.setAlpha(0.5);
        } else {
          vol.sprite.setAlpha(1);
        }
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
        this.terrainHeight * TILE_SIZE,
        this.terrainWidth * TILE_SIZE
      );
    }

    const now = Date.now();
    let publish = false;
    if (now - this.lastPublishTime >= 400) {
      publish = true;
      this.lastPublishTime = now;
    }
    this.handlePlayerMovement(publish);
  }

  handlePlayerMovement(publish: boolean) {
    const player = world.mobs[publicCharacterId];
    if (!(player && player.position)) {
      return;
    }

    // Prevent player movement if the chat overlay or brew scene is active
    if (
      this.scene.isActive('ChatOverlayScene') ||
      this.scene.isActive('BrewScene') ||
      this.scene.isActive('FightScene')
    ) {
      return;
    }

    let moveX = player.position.x;
    let moveY = player.position.y;

    let newX = moveX;
    let newY = moveY;

    if (this.keys['w']) {
      newY--;
    }
    if (this.keys['s']) {
      newY++;
    }
    if (this.keys['a']) {
      newX--;
    }
    if (this.keys['d']) {
      newX++;
    }

    // Check if the next step is blocked
    const nextItem = world.getItemAt(newX, newY);
    if (nextItem && !nextItem.isWalkable(player.unlocks)) {
      return;
    }

    // If no movement, return
    if (newX === moveX && newY === moveY) return;

    let roundedX;
    let roundedY;
    const negKeys = ['w', 'a'];
    if (negKeys.includes(this.lastKeyUp)) {
      roundedX = Math.floor(newX);
      roundedY = Math.floor(newY);
    } else {
      roundedX = Math.ceil(newX);
      roundedY = Math.ceil(newY);
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
      menu.setDepth(1001);
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
    this.sound.removeByKey('walk');
    this.sound.removeByKey('background_music');
    this.sound.removeByKey('background_music_layer');

    this.stopScenes();
    this.scene.start('LoadCharacterScene', { autoStart: false });
  }

  /* Stop all scenes related to game play and automatically restart game.*/
  resetToRespawn() {
    this.sound.removeByKey('walk');
    this.sound.removeByKey('background_music');
    this.sound.removeByKey('background_music_layer');

    this.stopScenes();
    this.scene.start('LoadCharacterScene', { autoStart: true });
  }

  /* Stop all scenes related to game play */
  stopScenes() {
    setGameState('uninitialized');
    const allScenes = this.scene.manager.getScenes();
    allScenes.forEach((scene) => {
      const key = scene.sys.settings.key;
      this.scene.stop(key);
    });
  }
}
