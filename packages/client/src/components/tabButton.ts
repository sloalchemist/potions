// components/tabButton.ts
import Phaser from 'phaser';

const BACK_COLOR = 0x874f36;
const FRONT_COLOR = 0xc39174;

export class TabButton extends Phaser.GameObjects.Container {
  text: Phaser.GameObjects.Text;
  background: Phaser.GameObjects.Graphics;
  callback: () => void;
  active: boolean = false;
  width: number;
  height: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    callback: () => void,
    width: number = 100,
    height: number = 40
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.callback = callback;
    this.width = width;
    this.height = height;

    // Create background graphics
    this.background = scene.add.graphics();
    this.drawTabShape(this.background, this.width, this.height, this.active);
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

    /*        const rectBorder = scene.add.rectangle(x, y, this.width, this.height, 0xFF0000);
        console.log('borders', -this.width / 2, -this.height / 2, this.width, this.height);
        rectBorder.setDepth(1001);*/

    this.setupInteractive();
  }
  private drawTabShape(
    graphics: Phaser.GameObjects.Graphics,
    width: number,
    height: number,
    active: boolean
  ) {
    graphics.clear();

    // Set fill color based on active state
    const fillColor = active ? FRONT_COLOR : BACK_COLOR;
    const strokeColor = 0xffffff;

    graphics.fillStyle(fillColor, 1);
    graphics.lineStyle(2, strokeColor, 1);

    // Draw tab shape with quadratic bezier curves
    graphics.beginPath();
    graphics.moveTo(-width / 2, height / 2);
    graphics.lineTo(-width / 2, -height / 2 + 10);

    // Define the first Quadratic Bezier curve
    const curve1 = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(-width / 2, -height / 2 + 10),
      new Phaser.Math.Vector2(-width / 2, -height / 2), // Control point
      new Phaser.Math.Vector2(-width / 2 + 10, -height / 2) // End point
    );

    // Draw the points from the first curve
    const points1 = curve1.getPoints(10);
    points1.forEach((point) => graphics.lineTo(point.x, point.y));

    // Continue drawing the lines
    graphics.lineTo(width / 2 - 10, -height / 2);

    // Define the second Quadratic Bezier curve
    const curve2 = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(width / 2 - 10, -height / 2),
      new Phaser.Math.Vector2(width / 2, -height / 2), // Control point
      new Phaser.Math.Vector2(width / 2, -height / 2 + 10) // End point
    );

    // Draw the points from the second curve
    const points2 = curve2.getPoints(10);
    points2.forEach((point) => graphics.lineTo(point.x, point.y));

    // Finish drawing the rest of the shape
    graphics.lineTo(width / 2, height / 2);
    if (!active) {
      graphics.closePath();
    }
    //graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    if (active) {
      // make a line at the bottom of the button colored 0xc39174
      graphics.lineStyle(2, 0xc39174, 1);
      graphics.beginPath();
      graphics.moveTo(-width / 2, height / 2);
      graphics.lineTo(width / 2, height / 2);
      graphics.strokePath();
    }
  }

  private setupInteractive() {
    this.on('pointerover', () => {
      if (!this.active) {
        //this.background.alpha = 1.;
      }
    });

    this.on('pointerout', () => {
      if (!this.active) {
        //this.background.alpha = 1.0;
      }
    });

    this.on('pointerdown', () => {
      this.callback();
    });
  }

  setTabActive(active: boolean): void {
    this.active = active;
    this.background.clear();
    this.drawTabShape(this.background, this.width, this.height, active);
  }
}
