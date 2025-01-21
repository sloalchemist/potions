
import { MobI } from '@rt-potion/common';
import { WorldScene } from '../scenes/worldScene';
import { SpriteItem } from './sprite_item';
import { world } from '../scenes/worldScene';
import { darkenColor } from '../utils/color';
import { PaletteSwapper } from './palette_swapper';
import { Mob } from '../world/mob';
import { Item } from '../world/item';
import { World } from '../world/world';

const TEXT_PLACEMENT_TO_SPRITE_OFFSET = 10;

export class SpriteMob extends Mob {
  sprite: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;
  doingText: Phaser.GameObjects.Text;
  scene: WorldScene;
  healthBar: Phaser.GameObjects.Graphics; // Health bar graphic
  maxHealth: number; // Store the max health of the mob for health bar calculations
  speechBubble?: Phaser.GameObjects.Graphics;
  speechText?: Phaser.GameObjects.Text;
  lastSpeech: string = '';
  speechBubbleVisible: boolean = false;
  attributeListeners: ((mob: SpriteMob, key: string, delta: number) => void)[] =
    [];
  collisionListeners: ((physicals: Item[]) => void)[] = [];
  mobRangeListeners: ((mobs: Mob[]) => void)[] = [];
  speechBubbleWidth?: number;
  speechBubbleHeight?: number;
  bubbleOffsetX?: number;
  bubbleOffsetY?: number;

  addCollisionListener(collisionListener: (physicals: Item[]) => void) {
    this.collisionListeners.push(collisionListener);
  }

  addMobRangeListener(listener: (mobs: Mob[]) => void) {
    this.mobRangeListeners.push(listener);
  }

  constructor(scene: WorldScene, mob: MobI) {
    super(
      world,
      mob.id,
      mob.name,
      mob.type,
      mob.maxHealth,
      mob.position,
      mob.attributes
    );
    this.scene = scene;
    this.path = mob.path;
    this.target = mob.target;
    this.subtype = mob.subtype;
    this.carrying = mob.carrying;
    this.doing = mob.doing;
    this.unlocks = mob.unlocks;

    if (this.subtype) {
      const parts = this.subtype.split('-');

      const eyeColor = Number(parts[0]);
      const bellyColor = Number(parts[1]);
      const furColor = Number(parts[2]);
      const idleKey = `${this.type}-${this.subtype}-idle`;
      const walkKey = `${this.type}-${this.subtype}-walk`;

      const furShade1Color = darkenColor(furColor, 25);
      const furShade2Color = darkenColor(furColor, 50);
      const paletteSwapper = PaletteSwapper.getInstance();
      paletteSwapper.swapAnimationPalette(
        scene,
        `${this.type}-idle`,
        idleKey,
        scene.mobSource[this.type],
        {
          COLOR_1: eyeColor,
          COLOR_2: bellyColor,
          COLOR_3: furColor,
          COLOR_3_DARK: furShade1Color,
          COLOR_3_DARKER: furShade2Color
        }
      );

      paletteSwapper.swapAnimationPalette(
        scene,
        `${this.type}-walk`,
        walkKey,
        scene.mobSource[this.type],
        {
          COLOR_1: eyeColor,
          COLOR_2: bellyColor,
          COLOR_3: furColor,
          COLOR_3_DARK: furShade1Color,
          COLOR_3_DARKER: furShade2Color
        }
      );
    }

    this.sprite = scene.add.sprite(
      ...scene.convertToWorldXY(this.position!),
      'notexist'
    );
    this.sprite.setDepth(1);
    this.sprite.setOrigin(0.5, 0.75);
    //this.sprite.setScale(2);

    this.nameText = scene.add
      .text(
        this.sprite.x,
        this.sprite.y + TEXT_PLACEMENT_TO_SPRITE_OFFSET,
        mob.name!,
        {
          fontFamily: 'Arial',
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#000000',
          strokeThickness: 2,
          stroke: '#FFFFFF',
        }
      )
      .setOrigin(0.5);
    this.nameText.setDepth(1);

    this.doingText = scene.add
      .text(
        this.sprite.x,
        this.sprite.y + TEXT_PLACEMENT_TO_SPRITE_OFFSET,
        mob.doing!,
        { 
          fontFamily: 'Arial', 
          fontSize: '12px', 
          color: '#000000',
          strokeThickness: 3,
          stroke: '#FFFFFF', 
        }
      )
      .setOrigin(0.5);
    this.doingText.setDepth(1);

    // Initialize the health bar graphic
    this.healthBar = scene.add.graphics();
    this.maxHealth = mob.maxHealth; // Set the max health to the mob's starting health
    if (!mob || !mob.attributes) {
      throw new Error(`Mob has no attributes ${mob} ${mob.attributes}`);
    }
    // iterate over each attribute and set it on the mob
    for (const [key, value] of Object.entries(mob.attributes)) {
      this.attributes[key] = value;
    }

    this.attributeListeners.push((spriteMob, key, delta) => {
      if (!spriteMob || key === 'target_speed_tick') {
        return;
      }

      let color = '#ffffff';
      if (key === 'health') {
        if (delta < 0) {
          spriteMob.createBloodSplat(0.5);
        }
        
        color = delta > 0 ? '#00ff00' : '#ff0000';
      } else if (key === 'gold') {
        color = '#ffd700';
      } else if (key === 'speed') {
        color = delta > 0 ? '#00ff00' : '#ff0000';
      }

      const attributeSprite = scene.add.text(
        spriteMob.sprite.x - 8,
        spriteMob.sprite.y - 16,
        delta.toString(),
        { font: '16px Arial', color: color }
      );

      attributeSprite.setDepth(1000);
      attributeSprite.setScale(1.5);
      attributeSprite.visible = true;

      // Introduce random variations for chaotic movement
      const randomXOffset = Phaser.Math.Between(-30, 30); // Random horizontal movement
      const randomYOffset = Phaser.Math.Between(-80, -120); // Random vertical end position
      const randomDuration = Phaser.Math.Between(2000, 4000); // Random duration for more chaos

      scene.tweens.add({
        targets: attributeSprite,
        x: attributeSprite.x + randomXOffset, // Add random horizontal movement
        y: spriteMob.sprite.y + randomYOffset, // Add random vertical movement
        alpha: 0,
        duration: randomDuration,
        ease: 'Cubic.easeOut', // Change easing function for more chaotic motion
        onComplete: () => {
          attributeSprite.destroy();
        }
      });
    });
  }

  showSpeechBubble(
    text: string,
    right: boolean,
    duration: number = 2000,
    maxBubbleWidth: number = 150
  ) {
    if (this.speechBubble || this.speechBubbleVisible) {
      this.speechBubble?.destroy();
      this.speechText?.destroy();
      this.speechBubbleVisible = false;
    }

    if (!this.position) {
      return;
    }

    // Configure the text style with word wrapping
    const style = {
      font: '14px Arial',
      color: '#000000',
      align: 'left',
      wordWrap: { width: maxBubbleWidth - 20 } // Allow wrapping with some padding
    };
    const timeOfChat = Date.now();

    // Add the speech text inside the bubble
    this.speechText = this.scene.add.text(0, 0, text, style).setOrigin(0, 0.5);
    this.speechText.setDepth(1001 + timeOfChat);

    // Calculate bubble size based on text size
    const textBounds = this.speechText.getBounds();
    const bubbleWidth = Math.min(textBounds.width + 20, maxBubbleWidth); // Ensure bubble doesn't exceed max width
    const bubbleHeight = textBounds.height + 20; // Add some padding

    this.speechBubbleWidth = bubbleWidth;
    this.speechBubbleHeight = bubbleHeight;

    // Speech bubble dimensions and position (slightly offset to the right)
    const bubbleOffsetX = right ? 30 : -(30 + bubbleWidth); // Shift the bubble more to the right of the character
    const bubbleOffsetY = -30; // Position slightly above the character
    this.bubbleOffsetX = bubbleOffsetX;
    this.bubbleOffsetY = bubbleOffsetY;

    // Create the speech bubble graphic with custom colors
    this.speechBubble = this.scene.add.graphics();
    this.speechBubble.fillStyle(0xffe4b5, 1); // Light peachy fill color
    this.speechBubble.fillRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10);
    this.speechBubble.lineStyle(2, 0xff6347, 1); // Tomato red border
    this.speechBubble.strokeRoundedRect(0, 0, bubbleWidth, bubbleHeight, 10);
    this.speechBubble.setDepth(1000 + timeOfChat);

    this.speechBubbleVisible = true;
    const showBubbleFor = (text.length / 15) * 1000 + 1000;

    this.lastSpeech = text;
    //console.log('showBubbleFor', text, showBubbleFor);
    // Make the bubble and text fade out after the duration
    this.scene.time.delayedCall(duration, () => {
      if (this.speechBubble && this.speechText) {
        this.scene.tweens.add({
          targets: [this.speechBubble, this.speechText],
          alpha: 0,
          ease: 'Linear',
          duration: showBubbleFor,
          onComplete: () => {
            if (this.lastSpeech === text) {
              this.speechBubble?.destroy();
              this.speechText?.destroy();
              this.speechBubbleVisible = false;
              console.log('Destroying speech bubble', text);
            }
          }
        });
      }
    });

    // Position the bubble relative to the sprite
    const bubbleX = this.sprite.x + bubbleOffsetX;
    const bubbleY = this.sprite.y + bubbleOffsetY;

    this.speechBubble.setPosition(bubbleX, bubbleY);
    this.speechText.setPosition(
      bubbleX + bubbleWidth / 2,
      bubbleY + bubbleHeight / 2
    );
  }

  updateHealthBar() {
    this.healthBar.clear();

    if (this.attributes['health'] < this.maxHealth) {
      const barWidth = 40;
      const barHeight = 5;

      const healthPercentage = this.attributes['health'] / this.maxHealth;

      const x = this.sprite.x - barWidth / 2;
      const y = this.sprite.y - 20;

      this.healthBar.fillStyle(0xff0000);
      this.healthBar.fillRect(x, y, barWidth, barHeight);

      this.healthBar.fillStyle(0x00ff00);
      this.healthBar.fillRect(x, y, barWidth * healthPercentage, barHeight);
    }
  }

  changeAttribute(
    attribute_key: string,
    delta: number,
    newValue: number
  ): void {
    this.attributes[attribute_key] = newValue;

    if (delta !== 0) {
      this.attributeListeners.forEach((listener) =>
        listener(this, attribute_key, delta)
      );
    }
  }

  animate(direction: string) {
    let animation_key = '';
    if (this.subtype) {
      animation_key = this.type + '-' + this.subtype + '-' + direction;
    } else {
      animation_key = this.type + '-' + direction;
    }
    if (
      !this.sprite.anims.currentAnim ||
      this.sprite.anims.currentAnim.key !== animation_key
    ) {
      //console.log('Playing animation', animation_key);

      this.sprite.anims.play(animation_key);
    }
  }

  createBloodSplat(size: number) {
    const sprite = this.scene.add.sprite(
      this.sprite.x,
      this.sprite.y - 16,
      'blood-splat'
    );

    sprite.setDepth(1000);
    sprite.setScale(size);
    sprite.visible = true;
    sprite.anims.play('blood-splat');

    sprite.on('animationcomplete', () => {
      sprite.destroy();
    });
  }

  destroy(world: World) {
    super.destroy(world);
    this.sprite.destroy();
    this.nameText.destroy();
    this.doingText.destroy();
    this.healthBar.destroy(); // Destroy the health bar when the mob is destroyed
    this.createBloodSplat(2);
    this.speechBubble?.destroy(); // Destroy speech bubble if it exists
    this.speechText?.destroy();
  }

  tick(world: World, deltaTime: number) {
    super.tick(world, deltaTime);

    if (this.collisionListeners.length > 0 && this.position) {
      const items = world.getItemsAt(this.position.x, this.position.y, 1);

      for (const listener of this.collisionListeners) {
        listener(items);
      }
    }

    if (this.mobRangeListeners.length > 0 && this.position) {
      const mobs = world.getMobsAt(
        Math.floor(this.position.x),
        Math.floor(this.position.y),
        5
      );
      for (const listener of this.mobRangeListeners) {
        listener(mobs);
      }
    }

    this.doingText.setText(this.doing);

    if (this.dead) {
      this.destroy(world);
      return;
    }

    if (!this.position) {
      throw new Error('Mob has no position');
    }
    [this.sprite.x, this.sprite.y] = this.scene.convertToWorldXY(this.position);

    const animation = this.target ? 'walk' : 'idle';

    if (Math.abs(this.angle) === Math.PI / 2) {
      // do nothing?
    } else if (Math.abs(this.angle) > Math.PI / 2) {
      this.sprite.flipX = true;
    } else {
      this.sprite.flipX = false;
    }

    this.animate(animation);

    this.nameText.setPosition(
      this.sprite.x,
      this.sprite.y + TEXT_PLACEMENT_TO_SPRITE_OFFSET
    );
    this.doingText.setPosition(
      this.sprite.x,
      this.sprite.y + TEXT_PLACEMENT_TO_SPRITE_OFFSET + 10
    );

    // Update the health bar position and value
    this.updateHealthBar();

    // Move the speech bubble along with the sprite
    if (
      this.speechBubble &&
      this.speechBubbleVisible &&
      this.speechBubbleWidth &&
      this.speechBubbleHeight &&
      this.bubbleOffsetX !== undefined &&
      this.bubbleOffsetY !== undefined
    ) {
      const bubbleX = this.sprite.x + this.bubbleOffsetX;
      const bubbleY = this.sprite.y + this.bubbleOffsetY;

      this.speechBubble.setPosition(bubbleX, bubbleY);
      this.speechText?.setPosition(
        bubbleX + 10,
        bubbleY + this.speechBubbleHeight / 2
      ); // Use stored dimensions and offsets
    }

    if (this.carrying) {
      const spriteItem = world.items[this.carrying] as SpriteItem;
      if (!spriteItem) {
        throw new Error(`Item not found ${this.key} carrying ${this.carrying}`);
      }
      spriteItem.sprite.setPosition(this.sprite.x, this.sprite.y - 24);
    }

    if (this.position) {
      this.sprite.setDepth(this.position.y);
      this.nameText.setDepth(this.position.y + 2);
    }
  }
}
