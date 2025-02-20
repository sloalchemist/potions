import Phaser from 'phaser';
import { Button } from '../../src/components/button';

// At the top, let's add some type definitions
type ButtonEventHandler = (
  pointer?: Phaser.Input.Pointer,
  localX?: number,
  localY?: number,
  event?: Phaser.Types.Input.EventData
) => void;

// Mock Phaser Scene and GameObjects
jest.mock('phaser', () => {
  const actualPhaser = jest.requireActual('phaser');
  return {
    ...actualPhaser,
    Scene: class MockScene {
      key: string;

      constructor(config: { key: string }) {
        this.key = config.key;
      }

      sys = {
        queueDepthSort: jest.fn(),
        displayList: { add: jest.fn() },
        updateList: { add: jest.fn() },
        events: {
          on: jest.fn(),
          once: jest.fn(),
          off: jest.fn(),
          emit: jest.fn()
        }
      };

      add = { existing: jest.fn() };

      game = {
        scale: {
          width: 800,
          height: 600
        }
      };
    },
    GameObjects: {
      Container: class MockContainer {
        scene: Phaser.Scene;
        x: number;
        y: number;
        eventHandlers: Map<string, ButtonEventHandler[]>;

        constructor(scene: Phaser.Scene, x: number, y: number) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.eventHandlers = new Map();
        }

        setInteractive = jest.fn().mockReturnThis();
        setScrollFactor = jest.fn().mockReturnThis();
        add = jest.fn().mockReturnThis();
        setSize = jest.fn().mockReturnThis();

        on(event: string, fn: ButtonEventHandler) {
          if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
          }
          this.eventHandlers.get(event)?.push(fn);
          return this;
        }

        emit(
          eventName: string,
          pointer?: Phaser.Input.Pointer | null,
          localX?: number,
          localY?: number,
          eventData?: Phaser.Types.Input.EventData
        ) {
          const handlers = this.eventHandlers.get(eventName) || [];
          handlers.forEach((handler) =>
            handler(pointer || undefined, localX, localY, eventData)
          );
          return this;
        }

        destroy = jest.fn();
      },
      Sprite: class MockSprite {
        width = 120;
        height = 40;
        scaleX = 1;
        scaleY = 1;
        setOrigin = jest.fn().mockReturnThis();
        setScale(scale: number) {
          this.scaleX = scale;
          this.scaleY = scale;
          return this;
        }
        on = jest.fn().mockReturnThis();
        once = jest.fn().mockReturnThis();
        removeFromDisplayList = jest.fn();
        addedToScene = jest.fn();
      },
      Text: class MockText {
        style = { fontSize: '15px' };
        width = 120;
        height = 40;
        scaleX = 1;
        scaleY = 1;
        setOrigin = jest.fn().mockReturnThis();
        setScale(scale: number) {
          this.scaleX = scale;
          this.scaleY = scale;
          return this;
        }
        on = jest.fn().mockReturnThis();
        once = jest.fn().mockReturnThis();
        setStyle = jest.fn().mockReturnThis();
        setFontSize = jest.fn().mockReturnThis();
        removeFromDisplayList = jest.fn();
        addedToScene = jest.fn();
      },
      Rectangle: class MockRectangle {
        fillColor = 0x8ca0b3;
        scaleX = 1;
        scaleY = 1;
        setOrigin = jest.fn().mockReturnThis();
        setScale(scale: number) {
          this.scaleX = scale;
          this.scaleY = scale;
          return this;
        }
        setFillStyle(color: number) {
          this.fillColor = color;
          return this;
        }
        setStrokeStyle = jest.fn().mockReturnThis();
        on = jest.fn().mockReturnThis();
        once = jest.fn().mockReturnThis();
        removeFromDisplayList = jest.fn();
        addedToScene = jest.fn();
      }
    }
  };
});

describe('Button Component', () => {
  let scene: Phaser.Scene;
  let button: Button;
  let textButton: Button;
  const mockCallback = jest.fn();

  beforeEach(() => {
    scene = new Phaser.Scene({ key: 'TestScene' });
    button = new Button(scene, 0, 0, false, 'texture', mockCallback);
    textButton = new Button(scene, 0, 0, true, 'Click me', mockCallback);
  });

  afterEach(() => {
    button?.destroy();
    textButton?.destroy();
    mockCallback.mockClear();
  });

  describe('Button Creation', () => {
    test('should create a sprite button with default dimensions', () => {
      expect(button.fixedWidth).toBe(120);
      expect(button.fixedHeight).toBe(40);
      expect(button.buttonBackground).toBeUndefined();
    });

    test('should create a text button with background', () => {
      expect(textButton.buttonBackground).toBeDefined();
      expect(textButton.buttonSprite instanceof Phaser.GameObjects.Text).toBe(
        true
      );
    });
  });

  describe('Button Interactions', () => {
    test('should handle hover state correctly', () => {
      button.emit('pointerover');

      expect(button.buttonSprite.scaleX).toBe(1.1);
      expect(button.buttonSprite.scaleY).toBe(1.1);

      if (button.buttonBackground) {
        expect(button.buttonBackground.scaleX).toBe(1.05);
        expect(button.buttonBackground.scaleY).toBe(1.05);
        expect(button.buttonBackground.fillColor).toBe(0xc0d9e8);
      }
    });

    test('should handle hover out state correctly', () => {
      // First hover over
      button.emit('pointerover');
      // Then hover out
      button.emit('pointerout');

      expect(button.buttonSprite.scaleX).toBe(1.0);
      expect(button.buttonSprite.scaleY).toBe(1.0);

      if (button.buttonBackground) {
        expect(button.buttonBackground.scaleX).toBe(1.0);
        expect(button.buttonBackground.scaleY).toBe(1.0);
        expect(button.buttonBackground.fillColor).toBe(0x8ca0b3);
      }
    });

    test('should handle click states correctly', () => {
      // Mock event for pointerdown
      const mockEvent = { stopPropagation: jest.fn() };

      // Press down
      button.emit('pointerdown', null, 0, 0, mockEvent);
      expect(button.buttonSprite.scaleX).toBe(0.9);
      expect(button.buttonSprite.scaleY).toBe(0.9);
      if (button.buttonBackground) {
        expect(button.buttonBackground.scaleX).toBe(0.95);
        expect(button.buttonBackground.scaleY).toBe(0.95);
        expect(button.buttonBackground.fillColor).toBe(0x5e7485);
      }
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      // Release (pointer up)
      button.emit('pointerup');
      expect(button.buttonSprite.scaleX).toBe(1.1);
      expect(button.buttonSprite.scaleY).toBe(1.1);
      if (button.buttonBackground) {
        expect(button.buttonBackground.scaleX).toBe(1.05);
        expect(button.buttonBackground.scaleY).toBe(1.05);
        expect(button.buttonBackground.fillColor).toBe(0xc0d9e8);
      }
      expect(mockCallback).toHaveBeenCalled();
    });

    test('should handle full interaction sequence', () => {
      const mockEvent = { stopPropagation: jest.fn() };

      // Hover over
      button.emit('pointerover');
      expect(button.buttonSprite.scaleX).toBe(1.1);

      // Press down
      button.emit('pointerdown', null, 0, 0, mockEvent);
      expect(button.buttonSprite.scaleX).toBe(0.9);

      // Release
      button.emit('pointerup');
      expect(button.buttonSprite.scaleX).toBe(1.1);
      expect(mockCallback).toHaveBeenCalled();

      // Move mouse out
      button.emit('pointerout');
      expect(button.buttonSprite.scaleX).toBe(1.0);
    });
  });

  describe('Button Styling', () => {
    test('should handle style changes for text buttons', () => {
      textButton.setStyle({ backgroundColor: '#ff0000', color: '#ffffff' });
      expect(textButton.buttonBackground?.fillColor).toBeDefined();
      expect(textButton.buttonSprite instanceof Phaser.GameObjects.Text).toBe(
        true
      );
    });

    test('should ignore color changes for sprite buttons', () => {
      const originalSprite = button.buttonSprite;
      button.setStyle({ backgroundColor: '#ff0000', color: '#ffffff' });
      expect(button.buttonSprite).toBe(originalSprite);
    });
  });
});
