import { ChatOverlayScene } from '../../src/scenes/chatOverlayScene';
import { chatPlayer } from '../../src/services/playerToServer';
import Phaser from 'phaser';

jest.mock('../../src/services/playerToServer', () => ({
  chatPlayer: jest.fn()
}));

describe('ChatOverlayScene', () => {
  let chatOverlayScene: ChatOverlayScene;
  let mockInputElement: HTMLInputElement;
  let mockDomElement: any;

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
      dom: jest.fn(() => mockDomElement)
    } as unknown as Phaser.GameObjects.GameObjectFactory;

    chatOverlayScene.cameras = {
      main: { centerX: 400, centerY: 300 }
    } as any;
  });

  test('should create an input field with placeholder', () => {
    chatOverlayScene.create();

    expect(chatOverlayScene.add.dom).toHaveBeenCalledWith(
      expect.any(Number),
      expect.any(Number),
      'input',
      expect.stringContaining('Type Message...')
    );
  });

  test('should send valid message on enter key', () => {
    chatOverlayScene.create();

    mockInputElement.value = 'Hello world';
    const event = new KeyboardEvent('keydown', { key: 'Enter' });

    // Simulate keydown event
    mockDomElement.on.mock.calls.forEach(([eventName, handler]: any) => {
      if (eventName === 'keydown') handler(event);
    });

    expect(chatPlayer).toHaveBeenCalledWith('Hello world');
    expect(mockInputElement.value).toBe('');
  });

  test('should show error if a word exceeds 10 characters', () => {
    chatOverlayScene.create();

    mockInputElement.value = 'Supercalifragilistic';
    const event = new KeyboardEvent('keydown', { key: 'Enter' });

    // Simulate keydown event
    mockDomElement.on.mock.calls.forEach(([eventName, handler]: any) => {
      if (eventName === 'keydown') handler(event);
    });

    expect(mockInputElement.value).toBe('Error: No word should exceed 10 characters!');
    expect(mockInputElement.style.color).toBe('red');
    expect(mockInputElement.disabled).toBe(true);
  });
});