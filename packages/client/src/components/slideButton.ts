import Phaser from 'phaser';

const BACK_COLOR = 0x874f36;
const FRONT_COLOR = 0xc39174;

export class SlideButton extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text;
  background: Phaser.GameObjects.Graphics;
  callback: () => void;
  active: boolean = false;
  width: number;
  height: number;
  direction: 'left' | 'right';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    callback: () => void,
    width: number = 100,
    height: number = 40,
    direction: 'left' | 'right' = 'left'
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.callback = callback;
    this.width = width;
    this.height = height;
    this.direction = direction;

    // Create background graphics
    this.background = scene.add.graphics();
    this.drawArrowShape(
      this.background,
      this.width,
      this.height,
      this.active,
      this.direction
    );
    this.add(this.background);

    // Create text
    this.text = scene.add
      .text(0, 0, label, {
        fontSize: '15px',
        color: '#ffffff',
        align: 'center'
      })
      .setOrigin(0.5, 0.5);
    this.add(this.text);

    // Set size
    this.setSize(this.width, this.height);

    // Interactive
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, this.width, this.height),
      Phaser.Geom.Rectangle.Contains
    );

    this.setupInteractive();
  }

  private drawArrowShape(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    active: boolean,
    direction: 'left' | 'right'
  ) {
    graphics.clear();

    // Set fill color based on active state
    const fillColor = active ? FRONT_COLOR : BACK_COLOR;
    const strokeColor = 0xffffff;

    graphics.fillStyle(fillColor, 1);
    graphics.lineStyle(2, strokeColor, 1);

    graphics.beginPath();
    if (direction === 'left') {
      graphics.moveTo(-width / 2, 0);
      graphics.lineTo(width / 4, -height / 3);
      graphics.lineTo(width / 4, -height / 6);
      graphics.lineTo((width * 5) / 8, -height / 6);
      graphics.lineTo((width * 5) / 8, height / 6);
      graphics.lineTo(width / 4, height / 6);
      graphics.lineTo(width / 4, height / 3);
    } else {
      graphics.moveTo(width / 2, 0);
      graphics.lineTo(-width / 4, -height / 3);
      graphics.lineTo(-width / 4, -height / 6);
      graphics.lineTo(-(width * 5) / 8, -height / 6);
      graphics.lineTo(-(width * 5) / 8, height / 6);
      graphics.lineTo(-width / 4, height / 6);
      graphics.lineTo(-width / 4, height / 3);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
  }

  private setupInteractive() {
    this.on('pointerover', () => {
      if (!this.active) {
        // Hover effect
      }
    });

    this.on('pointerout', () => {
      if (!this.active) {
        // Hover out effect
      }
    });

    this.on('pointerdown', () => {
      this.callback();
    });
  }

  setTabActive(active: boolean): void {
    this.active = active;
    this.background.clear();
    this.drawArrowShape(
      this.background,
      this.width,
      this.height,
      active,
      this.direction
    );
  }
}
