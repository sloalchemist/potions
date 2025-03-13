// Silence ESLint errors due to global Phaser
/* eslint-disable @typescript-eslint/no-explicit-any */

jest.mock('phaser', () => {
  class MockScene {
    config: any;
    constructor(config: any) {
      this.config = config;
    }
    add = {
      dom: jest.fn(() => ({
        node: document.createElement('input'),
        setOrigin: jest.fn().mockReturnThis(),
        addListener: jest.fn(),
        on: jest.fn()
      }))
    };
    cameras = {
      main: { centerX: 400, centerY: 300 }
    };
    game = {
      scale: { width: 800, height: 600 }
    };
  }

  return {
    Scene: MockScene,
    GameObjects: {
      DOMElement: class MockDOMElement {
        node = document.createElement('input');
        setOrigin = jest.fn().mockReturnThis();
        addListener = jest.fn();
        on = jest.fn();
      }
    }
  };
});

// Import Phaser after mocking it
import Phaser from 'phaser';
(global as any).Phaser = Phaser;

// Mock the chatPlayer service
import { chatPlayer } from '../../src/services/playerToServer';
jest.mock('../../src/services/playerToServer', () => ({
  chatPlayer: jest.fn()
}));

// Import the scene after mocking dependencies
import { ChatOverlayScene } from '../../src/scenes/chatOverlayScene';

describe('ChatOverlayScene', () => {
  let chatOverlayScene: ChatOverlayScene;
  let mockInputElement: HTMLInputElement;
  let mockDomElement: Partial<Phaser.GameObjects.DOMElement>;

  beforeEach(() => {
    chatOverlayScene = new ChatOverlayScene();

    mockInputElement = document.createElement('input');
    mockDomElement = {
      node: mockInputElement,
      setOrigin: jest.fn().mockReturnThis(),
      addListener: jest.fn(),
      on: jest.fn()
    };

    chatOverlayScene.add = {
      dom: jest.fn(() => mockDomElement as Phaser.GameObjects.DOMElement)
    } as unknown as Phaser.GameObjects.GameObjectFactory;

    chatOverlayScene.cameras = {
      main: { centerX: 400, centerY: 300 }
    } as any;
  });

  test('should create an input field with placeholder', () => {
    chatOverlayScene.create();

    expect(chatOverlayScene.add.dom).toHaveBeenCalledTimes(1);

    const [x, y, tagName, styles] = (chatOverlayScene.add.dom as jest.Mock).mock
      .calls[0];

    // Validate position
    expect(x).toEqual(expect.any(Number));
    expect(y).toEqual(expect.any(Number));

    // Validate the input element tag
    expect(tagName).toBe('input');

    // Ensure placeholder is correctly set
    expect(mockInputElement.placeholder).toBe('Type Message...');

    // Validate styles contain relevant CSS
    expect(styles).toContain('width: 280px');
    expect(styles).toContain('border: 2px solid white');
  });

  test('should send valid message on enter key', () => {
    chatOverlayScene.create();

    mockInputElement.value = 'Hello world';
    const event = new KeyboardEvent('keydown', { key: 'Enter' });

    (mockDomElement.on as jest.Mock).mock.calls.forEach(
      ([eventName, handler]: [string, (event: KeyboardEvent) => void]) => {
        if (eventName === 'keydown') handler(event);
      }
    );

    expect(chatPlayer).toHaveBeenCalledWith('Hello world');
    expect(mockInputElement.value).toBe('');
  });

  test('should show error if a word exceeds 10 characters', () => {
    chatOverlayScene.create();

    mockInputElement.value = 'Supercalifragilistic';
    const event = new KeyboardEvent('keydown', { key: 'Enter' });

    (mockDomElement.on as jest.Mock).mock.calls.forEach(
      ([eventName, handler]: [string, (event: KeyboardEvent) => void]) => {
        if (eventName === 'keydown') handler(event);
      }
    );

    expect(mockInputElement.value).toBe(
      'Error: No word should exceed 10 characters!'
    );
    expect(mockInputElement.style.color).toBe('red');
    expect(mockInputElement.disabled).toBe(true);
  });
});
