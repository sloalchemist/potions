class MessageComponent extends Phaser.GameObjects.Container {
  private messageText: Phaser.GameObjects.Text;
  private timerText: Phaser.GameObjects.Text;
  private startTime: number;
  private duration: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    message: string,
    duration: number
  ) {
    super(scene, x, y);

    this.duration = duration; // duration in seconds
    this.startTime = scene.time.now;

    // Create the background box
    const box = scene.add.rectangle(0, 0, 200, 50, 0x000000, 0.6);
    box.setOrigin(1, 0.5); // Align box to the right

    // Create the message text
    this.messageText = scene.add
      .text(-190, 0, message, {
        fontSize: '16px',
        color: '#ffffff'
      })
      .setOrigin(0, 0.5);

    // Create the timer text
    this.timerText = scene.add
      .text(-10, 0, '', {
        fontSize: '16px',
        color: '#ffffff'
      })
      .setOrigin(1, 0.5);

    // Add components to the container
    this.add([box, this.messageText, this.timerText]);

    // Update the timer every second
    scene.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }

  private updateTimer(): void {
    const elapsed = (this.scene.time.now - this.startTime) / 1000;
    const remaining = this.duration - elapsed;

    if (remaining > 90) {
      this.timerText.setText(`${Math.ceil(remaining / 60)}m`);
    } else if (remaining > 0) {
      this.timerText.setText(`${Math.ceil(remaining)}s`);
    } else {
      this.destroy(); // Remove component when time is up
    }
  }
}

export class MessageStack {
  private scene: Phaser.Scene;
  private stack: MessageComponent[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public addMessage(message: string, duration: number): void {
    const xPosition = this.scene.scale.width - 10; // 10px from the right edge
    const yPosition = this.stack.length * 60 + 30; // Stack with 10px margin from the top

    const messageComponent = new MessageComponent(
      this.scene,
      xPosition,
      yPosition,
      message,
      duration
    );
    this.scene.add.existing(messageComponent);
    this.stack.push(messageComponent);

    // Remove from stack when destroyed
    messageComponent.once('destroy', () => {
      this.stack = this.stack.filter((msg) => msg !== messageComponent);
      this.repositionMessages();
    });
  }

  private repositionMessages(): void {
    const xPosition = this.scene.scale.width - 10;
    this.stack.forEach((msg, index) => {
      msg.y = index * 60 + 30; // Reposition vertically with 10px top margin
      msg.x = xPosition;
    });
  }
}

// // Example usage in a scene
// class MyScene extends Phaser.Scene {
//     private messageStack: MessageStack;

//     constructor() {
//         super({ key: 'MyScene' });
//     }

//     public create(): void {
//         this.messageStack = new MessageStack(this);

//         // Add a sample message
//         this.messageStack.addMessage("Task completed!", 120); // 2 minutes
//         this.messageStack.addMessage("Starting soon...", 30); // 30 seconds
//     }
// }

// const config: Phaser.Types.Core.GameConfig = {
//     type: Phaser.AUTO,
//     width: 800,
//     height: 600,
//     scene: MyScene,
// };

// const game = new Phaser.Game(config);
