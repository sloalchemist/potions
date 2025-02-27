// Mock Phaser 
jest.mock('phaser', () => ({
  ...jest.requireActual('phaser'),
  Scene: class MockScene {
    key: string;
    constructor(config: { key: string }) {
      this.key = config.key;
    }
    add = {
      graphics: () => ({
        fillStyle: jest.fn((e) => e).mockReturnThis(),
        fillRect: jest.fn((e) => e)
      })
    };
    game = {
      scale: {
        width: 800,
        height: 600
      }
    };
  }
}));

// Define the global fight function 
(global as any).fight = jest.fn();

import Phaser from 'phaser';
import { FightScene } from '../../src/scenes/fightScene';

// Define the callFight function as it is used in the project
const callFight = function (this: any, attack: string, i: number) {
  if (this.scene.isActive('FightScene')) {
    this.scene.stop('FightScene');
  } else {
    this.scene.launch('FightScene');
  }
  // Call the global fight function.
  (global as any).fight(attack, i);
  this.setFightOptions([]);
};

describe('Testing Fight Scene is properly activate and stopped', () => {
  let testScene: any;

  beforeEach(() => {
    // Instantiate a new Phaser Scene
    testScene = new Phaser.Scene({ key: 'TestScene' });
    // Add the properties expected by callFight
    testScene.scene = {
      isActive: jest.fn(),
      launch: jest.fn(),
      stop: jest.fn()
    };
    testScene.setFightOptions = jest.fn();
    // Ensure the global fight function is reset before each test
    (global as any).fight.mockClear();
  });

  test('should launch FightScene when not active', () => {
    // Simulate that FightScene is not active.
    testScene.scene.isActive.mockReturnValue(false);

    // Call callFight with the testScene as context.
    callFight.call(testScene, 'Test Attack', 0);

    // Verify that the Fight Scene launched
    expect(testScene.scene.launch).toHaveBeenCalledWith('FightScene');
    // Verify that the global fight function was called correctly
    expect((global as any).fight).toHaveBeenCalledWith('Test Attack', 0);
    // Verify that fight options were cleared
    expect(testScene.setFightOptions).toHaveBeenCalledWith([]);
  });

  test('should stop FightScene when active', () => {
    // Simulate that FightScene is active
    testScene.scene.isActive.mockReturnValue(true);

    callFight.call(testScene, 'Stab', 1);

    expect(testScene.scene.stop).toHaveBeenCalledWith('FightScene');
    expect((global as any).fight).toHaveBeenCalledWith('Stab', 1);
  });
});

describe('Movement Disabled when FightScene Active', () => {
  let worldScene: any;
  let pointerCallback: (pointer: any) => void;
  let publishPlayerPositionMock: jest.Mock;

  // These variables simulate values used in the input handler
  const world = { mobs: { player1: {} } };
  const publicCharacterId = 'player1';
  const cameraViewportX = 0;
  const cameraViewportY = 0;
  const cameraViewportWidth = 800;
  const cameraViewportHeight = 600;
  const TILE_SIZE = 32;

  beforeEach(() => {
    // Create a jest mock for publishPlayerPosition
    publishPlayerPositionMock = jest.fn();

    // Create a simple event registry for input events
    const inputEventCallbacks: Record<string, (pointer: any) => void> = {};
    const input = {
      on: jest.fn((eventName: string, callback: (pointer: any) => void) => {
        inputEventCallbacks[eventName] = callback;
      }),
      keyboard: {
        on: jest.fn() 
      }
    };

    // Create a minimal worldScene object with the properties used in the handler
    worldScene = {
      input,
      scene: {
        isActive: jest.fn()
      },
    };

    // minimal version of the pointerdown handler
    // In the real code this would be inside the world scene's create() method
    worldScene.input.on('pointerdown', (pointer: any) => {
      if (!world.mobs[publicCharacterId]) {
        return;
      }

      // Check if the pointer event is within the viewport
      if (
        pointer.x >= cameraViewportX &&
        pointer.x <= cameraViewportX + cameraViewportWidth &&
        pointer.y >= cameraViewportY &&
        pointer.y <= cameraViewportY + cameraViewportHeight
      ) {
        // Prevent movement if FightScene is active
        if (
          worldScene.scene.isActive('FightScene')
        ) {
          return;
        }

        publishPlayerPositionMock({
          x: pointer.worldX / TILE_SIZE,
          y: pointer.worldY / TILE_SIZE
        });
      }
    });

    // Grab the registered pointerdown callback for later invocation
    pointerCallback = inputEventCallbacks['pointerdown'];
  });

  test('does not publish player position when FightScene is active', () => {
    // Simulate that FightScene is active.
    worldScene.scene.isActive.mockImplementation((sceneName: string) => {
      return sceneName === 'FightScene';
    });

    // Create a pointer event that is within the viewport
    const pointer = {
      x: 100,
      y: 100,
      worldX: 100,
      worldY: 100
    };

    // Simulate the pointerdown event
    pointerCallback(pointer);

    // Since FightScene is active, publishPlayerPosition should not be called
    expect(publishPlayerPositionMock).not.toHaveBeenCalled();
  });
});