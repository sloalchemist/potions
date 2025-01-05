import { Coord, HouseI } from '@rt-potion/common';
import { WorldScene } from '../scenes/worldScene';
import { World } from '../world/world';

export class SpriteHouse {
  scene: WorldScene;
  floorSprites: Phaser.GameObjects.Sprite[] = [];
  roofSprites: Phaser.GameObjects.Sprite[] = [];
  key: string;
  top_left: Coord;
  width: number;
  height: number;

  constructor(scene: WorldScene, house: HouseI) {
    this.key = house.id;
    this.top_left = house.top_left;
    this.width = house.width;
    this.height = house.height;

    this.scene = scene;

    const minX = house.top_left.x;
    const maxX = house.top_left.x + house.width;
    const minY = house.top_left.y - 1;
    const maxY = house.top_left.y + house.height;
    const midY = Math.floor((maxY + minY) / 2);

    for (let x = minX + 1; x < maxX; x++) {
      for (let y = minY + 1; y < maxY + 1; y++) {
        const floorSprite = scene.add.sprite(
          ...scene.convertToWorldXY({ x, y }),
          'global_atlas'
        );
        this.floorSprites.push(floorSprite);
        floorSprite.setDepth(0.1);
        floorSprite.setFrame('floor');
      }
    }

    this.generateRoofSprite(scene, { x: minX, y: minY }, 'roof-top-left');
    this.generateRoofSprite(scene, { x: maxX, y: minY }, 'roof-top-right');
    this.generateRoofSprite(scene, { x: minX, y: maxY }, 'roof-bottom-left');
    this.generateRoofSprite(scene, { x: maxX, y: maxY }, 'roof-bottom-right');

    this.generateRoofSprite(scene, { x: minX, y: midY }, 'roof-middle-left');
    this.generateRoofSprite(scene, { x: maxX, y: midY }, 'roof-middle-right');

    for (let x = minX + 1; x < maxX; x++) {
      this.generateRoofSprite(scene, { x, y: maxY }, 'roof-bottom');
      this.generateRoofSprite(scene, { x, y: minY }, 'roof-top');
      this.generateRoofSprite(
        scene,
        { x, y: (maxY + minY) / 2 },
        'roof-middle'
      );
    }

    for (let y = midY + 1; y < maxY; y++) {
      this.generateRoofSprite(scene, { x: minX, y }, 'roof-lower-left');
      this.generateRoofSprite(scene, { x: maxX, y }, 'roof-lower-right');
      for (let x = minX + 1; x < maxX; x++) {
        this.generateRoofSprite(scene, { x, y }, 'roof-lower');
      }
    }

    for (let y = minY + 1; y < midY; y++) {
      this.generateRoofSprite(scene, { x: minX, y }, 'roof-upper-left');
      this.generateRoofSprite(scene, { x: maxX, y }, 'roof-upper-right');
      for (let x = minX + 1; x < maxX; x++) {
        this.generateRoofSprite(scene, { x, y }, 'roof-upper');
      }
    }
  }

  generateRoofSprite(scene: WorldScene, coord: Coord, frame: string) {
    const roofSprite = scene.add.sprite(
      ...scene.convertToWorldXY(coord),
      'global_atlas'
    );
    roofSprite.setFrame(frame);
    this.roofSprites.push(roofSprite);
    roofSprite.setDepth(100);
  }

  animate(x: number, y: number) {
    if (
      x < this.top_left.x ||
      x >= this.top_left.x + this.width ||
      y < this.top_left.y ||
      y >= this.top_left.y + this.height
    ) {
      this.roofSprites.forEach((sprite) => sprite.setAlpha(1));
    } else {
      this.roofSprites.forEach((sprite) => sprite.setAlpha(0.05));
    }
  }

  destroy(world: World) {
    this.floorSprites.forEach((sprite) => sprite.destroy());
    this.roofSprites.forEach((sprite) => sprite.destroy());
    delete world.houses[this.key];
  }
}
