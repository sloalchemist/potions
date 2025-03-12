import * as Phaser from 'phaser';

export interface LoadingIndicator {
  container: Phaser.GameObjects.Rectangle;
  bar: Phaser.GameObjects.Rectangle;
  text: Phaser.GameObjects.Text;
  fileText: Phaser.GameObjects.Text;
}

export interface LoadingProgressBarConfig {
  width?: number;
  height?: number;
  padding?: number;
  barColor?: number;
  containerColor?: number;
  verticalOffset?: number;
  depth?: number;
  textConfig?: {
    fontSize?: string;
    fontStyle?: string;
    color?: string;
    backgroundColor?: string;
    padding?: { x: number; y: number };
  };
  loadingText?: string;
}

export class LoadingProgressBar {
  private indicator?: LoadingIndicator;
  private progress: number = 0;
  private scene: Phaser.Scene;
  private targetProgress: number = 0;
  private smoothSpeed: number = 0.3; // Even faster response
  private config: Required<LoadingProgressBarConfig>;
  private currentFile: string = '';

  constructor(scene: Phaser.Scene, config: LoadingProgressBarConfig = {}) {
    this.scene = scene;
    this.config = {
      width: config.width ?? 400,
      height: config.height ?? 40,
      padding: config.padding ?? 4,
      barColor: config.barColor ?? 0x4caf50,
      containerColor: config.containerColor ?? 0x333333,
      verticalOffset: config.verticalOffset ?? -100,
      depth: config.depth ?? 1000,
      textConfig: {
        fontSize: config.textConfig?.fontSize ?? '24px',
        fontStyle: config.textConfig?.fontStyle ?? 'bold',
        color: config.textConfig?.color ?? '#ffffff',
        backgroundColor: config.textConfig?.backgroundColor ?? '#000000',
        padding: config.textConfig?.padding ?? { x: 20, y: 10 }
      },
      loadingText: config.loadingText ?? 'Loading World'
    };
  }

  create(): void {
    const {
      width,
      height,
      padding,
      barColor,
      containerColor,
      textConfig,
      loadingText,
      verticalOffset,
      depth
    } = this.config;

    // Calculate position relative to game scale
    const centerX = this.scene.game.scale.width / 2;
    const centerY = this.scene.game.scale.height / 2 + verticalOffset;

    // Container (outline)
    const container = this.scene.add.rectangle(
      centerX,
      centerY,
      width,
      height,
      containerColor
    );
    container.setOrigin(0.5);
    container.setScrollFactor(0);
    container.setDepth(depth);

    // Progress bar
    const bar = this.scene.add.rectangle(
      centerX - width / 2 + padding,
      centerY,
      0, // Start with width 0
      height - padding * 2,
      barColor
    );
    bar.setOrigin(0, 0.5);
    bar.setScrollFactor(0);
    bar.setDepth(depth);

    // Loading text
    const text = this.scene.add.text(
      centerX,
      centerY - height,
      loadingText,
      textConfig
    );
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(depth);

    // Current file text
    const fileText = this.scene.add.text(centerX, centerY + height + 10, '', {
      ...textConfig,
      fontSize: '16px'
    });
    fileText.setOrigin(0.5);
    fileText.setScrollFactor(0);
    fileText.setDepth(depth);

    this.indicator = { container, bar, text, fileText };
  }

  /**
   * Set the target progress value (0-1). The bar will smoothly animate to this value.
   */
  setProgress(value: number): void {
    // Ensure we never go backwards in progress
    this.targetProgress = Math.max(this.targetProgress, Math.min(1, value));
  }

  /**
   * Set the current file being loaded
   */
  setCurrentFile(filename: string): void {
    this.currentFile = filename;
  }

  /**
   * Update the loading bar animation
   */
  update(): void {
    if (!this.indicator) return;

    const { bar, container, text, fileText } = this.indicator;
    const prevProgress = this.progress;

    // Smoothly interpolate current progress toward target
    this.progress += (this.targetProgress - this.progress) * this.smoothSpeed;

    // Only update visuals if progress changed
    if (this.progress !== prevProgress) {
      const barWidth = container.width - this.config.padding * 2;
      bar.width = barWidth * this.progress;
      text.setText(
        `${this.config.loadingText} ${Math.floor(this.progress * 100)}%`
      );
    }

    // Always update file text in case it changed
    fileText.setText(this.currentFile);

    // Ensure everything is visible and rendered
    container.setVisible(true);
    bar.setVisible(true);
    text.setVisible(true);
    fileText.setVisible(true);
  }

  /**
   * Update the loading text
   */
  setText(text: string): void {
    if (!this.indicator) return;
    this.indicator.text.setText(text);
  }

  destroy(): void {
    if (!this.indicator) return;
    console.log('Destroying loading bar'); // Debug log
    this.indicator.container.destroy();
    this.indicator.bar.destroy();
    this.indicator.text.destroy();
    this.indicator.fileText.destroy();
    this.indicator = undefined;
  }
}
