import { Coord, ItemI } from '@rt-potion/common';
import { WorldScene } from '../scenes/worldScene';
import { world } from '../scenes/worldScene';
import { darkenColor } from '../utils/color';
import { PaletteSwapper } from './palette_swapper';
import { Item } from '../world/item';
import { World } from '../world/world';
import { Mob } from '../world/mob';

export class SpriteItem extends Item {
  sprite: Phaser.GameObjects.Sprite;
  scene: WorldScene;
  priceText: Phaser.GameObjects.Text | undefined;
  outText: Phaser.GameObjects.Text | undefined;
  templateSprite: Phaser.GameObjects.Sprite | undefined;
  flat: boolean;
  hasPickedupFrame: boolean = false;
  healthBar?: Phaser.GameObjects.Graphics;
  maxHealth?: number;
  ownedBy?: string;

  constructor(scene: WorldScene, item: ItemI) {
    super(world, item.id, item.position, scene.itemTypes[item.type]);
    this.flat = this.itemType.flat == true;
    this.name = item.name;
    this.subtype = item.subtype;
    this.templateType = item.templateType;
    this.house = item.house;
    this.carried_by = item.carried_by;
    this.lock = item.lock;
    this.ownedBy = item.ownedBy;

    // copy over all attributes
    for (const key in item.attributes) {
      this.attributes[key] = item.attributes[key];
    }
    // Intialize health bar for smashable item types
    if (this.itemType.layout_type) {
      this.healthBar = scene.add.graphics();
      scene.itemTypes[item.type].attributes?.forEach((attribute) => {
        if (attribute['name'] == 'health') {
          this.maxHealth = Number(attribute['value']);
        }
      });
    }

    let x, y;

    if (item.position) {
      [x, y] = [item.position.x, item.position.y];
    } else if (item.carried_by) {
      const pos = world.mobs[item.carried_by].position;
      if (!pos) {
        throw new Error('Carried by doesnt exist');
      }
      [x, y] = [pos.x, pos.y];
    } else {
      // throw error as should never happen
      throw new Error('Item has no position or carrier');
    }

    this.sprite = scene.add.sprite(
      ...scene.convertToWorldXY({ x, y }),
      scene.itemSource[item.type]
    );
    this.sprite.setScale(1);
    if (scene.textures.get(scene.itemSource[item.type]).has(item.type)) {
      const texture = scene.textures
        .get(scene.itemSource[item.type])
        .get(item.type);
      //console.log('Creating item', this.key, this.type, texture.width, texture.height);
      if (texture.height > 48) {
        this.sprite.setOrigin(0.5, 0.75);
      }
    }

    if (
      scene.textures
        .get(scene.itemSource[item.type])
        .has(item.type + '-picked-up')
    ) {
      this.hasPickedupFrame = true;
    }

    this.scene = scene;

    if (this.subtype) {
      const parts = this.subtype.split('-');

      const color1 = Number(parts[0]);
      const color1dark = darkenColor(color1, 25);
      const paletteSwapper = PaletteSwapper.getInstance();

      paletteSwapper.swapPalette(
        scene,
        'global_atlas',
        `${this.type}`,
        `${this.type}-${this.subtype}`,
        { COLOR_1: color1, COLOR_1_DARK: color1dark }
      );
      if (this.hasPickedupFrame) {
        paletteSwapper.swapPalette(
          scene,
          'global_atlas',
          `${this.type}-picked-up`,
          `${this.type}-${this.subtype}-picked-up`,
          { COLOR_1: color1, COLOR_1_DARK: color1dark }
        );
      }
    }

    if (this.itemType.show_price_at && 'price' in this.attributes) {
      this.priceText = scene.add
        .text(
          this.sprite.x + this.itemType.show_price_at.x,
          this.sprite.y + this.itemType.show_price_at.y,
          this.attributes['price'].toString(),
          { font: '10px Arial', color: '#000000' }
        )
        .setOrigin(1);
      this.priceText.setDepth(this.position!.y + 0.75);
    }

    if ('items' in this.attributes) {
      this.outText = scene.add
        .text(this.sprite.x, this.sprite.y, '∅', {
          fontFamily: 'Arial',
          fontSize: '30px',
          fontStyle: 'bold',
          color: '#FF0000',
          strokeThickness: 3,
          stroke: '#000000'
        })
        .setOrigin(0.5);
      this.outText.setDepth(this.position!.y + 0.75);
    }

    if (this.templateType && this.itemType.show_template_at) {
      const [tx, ty] = scene.convertToWorldXY({ x, y });
      const xAdjust = this.itemType.show_template_at.x;
      const yAdjust = this.itemType.show_template_at.y;
      this.templateSprite = scene.add.sprite(
        tx + xAdjust,
        ty + yAdjust,
        scene.itemSource[this.templateType]
      );
      this.templateSprite.setScale(0.6);
    }

    this.animate();
    if (
      this.type === 'wall' ||
      this.type === 'door' ||
      this.type === 'fence' ||
      this.type === 'gate'
    ) {
      const above = world.getItemAt(this.position!.x, this.position!.y - 1);
      const below = world.getItemAt(this.position!.x, this.position!.y + 1);
      const left = world.getItemAt(this.position!.x - 1, this.position!.y);
      const right = world.getItemAt(this.position!.x + 1, this.position!.y);

      if (above) {
        (above as SpriteItem).animate();
      }
      if (below) {
        (below as SpriteItem).animate();
      }
      if (left) {
        (left as SpriteItem).animate();
      }
      if (right) {
        (right as SpriteItem).animate();
      }
    }
  }

  destroy(world: World) {
    super.destroy(world);
    //console.log('Destroying item', this.key);
    this.healthBar?.destroy();
    this.sprite.destroy();
    if (this.priceText) {
      this.priceText.destroy();
    }
    if (this.outText) {
      this.outText.destroy();
    }
  }

  sameItemGroup(item: Item | undefined): boolean {
    return (
      item != null &&
      item.itemType.item_group !== undefined &&
      item.itemType.item_group === this.itemType.item_group
    );
  }

  animate() {
    let animation_key;

    if (this.templateSprite && this.templateType) {
      this.templateSprite.setFrame(this.templateType);
    }

    if (this.itemType.layout_type === 'opens') {
      if (this.position) {
        const nearbyMobs = world.getMobsAt(this.position.x, this.position.y, 2);
        //console.log('Animating gate', this.position, nearbyMobs, this.lock);
        if (nearbyMobs.some((mob) => mob.unlocks.includes(this.lock!))) {
          //console.log('Gate open');
          this.sprite.setFrame(`${this.type}-open`);
        } else {
          this.sprite.setFrame(`${this.type}-closed`);
        }
      }
    } else if (this.itemType.layout_type === 'fence') {
      const above = this.sameItemGroup(
        world.getItemAt(this.position!.x, this.position!.y - 1)
      );
      const below = this.sameItemGroup(
        world.getItemAt(this.position!.x, this.position!.y + 1)
      );
      const left = this.sameItemGroup(
        world.getItemAt(this.position!.x - 1, this.position!.y)
      );
      const right = this.sameItemGroup(
        world.getItemAt(this.position!.x + 1, this.position!.y)
      );

      const animationKey = [this.type];
      if (below) {
        animationKey.push('b');
      }
      if (above) {
        animationKey.push('t');
      }
      if (right) {
        animationKey.push('r');
      }
      if (left) {
        animationKey.push('l');
      }

      animation_key = `${animationKey.join('_')}`;
      this.sprite.setFrame(animation_key);
    } else if (this.itemType.layout_type === 'wall') {
      const house = this.house ? world.houses[this.house] : null;

      const above = this.sameItemGroup(
        world.getItemAt(this.position!.x, this.position!.y - 1)
      );
      const below = this.sameItemGroup(
        world.getItemAt(this.position!.x, this.position!.y + 1)
      );
      const left = this.sameItemGroup(
        world.getItemAt(this.position!.x - 1, this.position!.y)
      );
      const right = this.sameItemGroup(
        world.getItemAt(this.position!.x + 1, this.position!.y)
      );

      //console.log('Animating wall', this.house, house, this.position, above, below, left, right);

      if (above && left) {
        //console.log("above and left");
        this.sprite.setFrame(`${this.type}-bottom-right`);
      } else if (above && right) {
        this.sprite.setFrame(`${this.type}-bottom-left`);
      } else if (below && left) {
        this.sprite.setFrame(`${this.type}-top-right`);
      } else if (below && right) {
        this.sprite.setFrame(`${this.type}-top-left`);
      } else if (above) {
        if (house) {
          if (house.top_left.x == this.position!.x) {
            //console.log('house left');
            this.sprite.setFrame(`${this.type}-left`);
          } else {
            //console.log('house right');
            this.sprite.setFrame(`${this.type}-right`);
          }
        } else {
          this.sprite.setFrame(`${this.type}-right`);
        }
      } else {
        this.sprite.setFrame(`${this.type}-top`);
      }
    } else if (this.subtype) {
      if (this.carried_by) {
        animation_key = `${this.type}-${this.subtype}-picked-up`;
      } else {
        animation_key = `${this.type}-${this.subtype}`;
      }
      this.sprite.setTexture(animation_key);
    } else {
      if (this.hasPickedupFrame && this.carried_by) {
        animation_key = `${this.type}-picked-up`;
      } else {
        animation_key = `${this.type}`;
      }
      this.sprite.setFrame(animation_key);
    }

    //console.log('Playing animation', animation_key);
    if (this.priceText && this.attributes['price']) {
      this.priceText.setText(this.attributes['price'].toString());
    }

    if ('items' in this.attributes) {
      if ((this.attributes['items'] as number) > 0) {
        this.outText?.setVisible(false);
      } else {
        this.outText?.setVisible(true);
      }
    }
  }

  pickup(world: World, mob: Mob): void {
    super.pickup(world, mob);

    this.animate();
  }

  stash(world: World, mob: Mob, position: Coord): void {
    super.stash(world, mob, position);
    this.sprite.setDepth(0);
    [this.sprite.x, this.sprite.y] = [-1, -1];
    this.animate();
  }

  drop(world: World, mob: Mob, position: Coord): void {
    super.drop(world, mob, position);
    this.sprite.setDepth(0);
    if (this.position) {
      [this.sprite.x, this.sprite.y] = this.scene.convertToWorldXY(
        this.position
      );
    }
    this.animate();
  }

  unstash(world: World, mob: Mob, position: Coord): void {
    // Call base unstash to update world state
    super.unstash(world, mob, position);
    // Reposition and make sprite visible
    if (this.position) {
      const [worldX, worldY] = this.scene.convertToWorldXY(this.position);
      this.sprite.x = worldX;
      this.sprite.y = worldY;
    }
    this.sprite.visible = true;
    this.animate();
  }

  calculateHealthPercentage() {
    return Number(this.attributes['health']) / this.maxHealth!;
  }

  isBelowMaxHealth() {
    return Number(this.attributes['health']) < this.maxHealth!;
  }

  updateHealthBar() {
    this.healthBar?.clear();

    if (this.isBelowMaxHealth()) {
      const barWidth = 40;
      const barHeight = 5;

      const healthPercentage = this.calculateHealthPercentage();

      const x = this.sprite.x - barWidth / 2;
      const y = this.sprite.y - 20;

      this.healthBar?.fillStyle(0xff0000);
      this.healthBar?.fillRect(x, y, barWidth, barHeight);

      this.healthBar?.fillStyle(0x00ff00);
      this.healthBar?.fillRect(x, y, barWidth * healthPercentage, barHeight);
      this.healthBar?.setDepth(1000);
    }
  }

  tick(world: World, deltaTime: number) {
    super.tick(world, deltaTime);
    if (this?.healthBar) {
      this.updateHealthBar();
    }
    if (this.position) {
      let depth = this.position.y + 0.5;
      if (this.flat) {
        depth = 0;
      }
      if (this.carried_by) {
        depth += 1;
      }
      this.sprite.setDepth(depth);
      if (this.templateSprite) {
        this.templateSprite?.setDepth(depth + 0.1);
      }

      if (this.type === 'door' || this.type === 'gate') {
        this.animate();
      }
    }
  }
}
