// IMPORTANT: MOCK THE BUTTON COMPONENT BEFORE IMPORTING UxScene
jest.mock('../../src/components/button', () => {
    // A fake Button that does not call Phaser internals
    return {
      Button: class FakeButton {
        // Save the parameters so we can inspect them in tests
        public scene: any;
        public x: number;
        public y: number;
        public enabled: boolean;
        public texture: string;
        public callback: Function;
        public width?: number;
        public height?: number;
        
        constructor(
          scene: any,
          x: number,
          y: number,
          enabled: boolean,
          texture: string,
          callback: Function,
          width?: number,
          height?: number
        ) {
          this.scene = scene;
          this.x = x;
          this.y = y;
          this.enabled = enabled;
          this.texture = texture;
          this.callback = callback;
          this.width = width;
          this.height = height;
        }
        
        // A no op destroy method.
        destroy() {}
        
        // event emitter to simulate pointer events.
        emit(event: string, ...args: any[]) {
          if (event === 'pointerdown') {
            this.callback(...args);
          }
        }
      }
    };
  });
  
  // minimal Phaser mock so that UxScene can be instantiated
jest.mock('phaser', () => {
    class MockScene {
      config: any;
      constructor(config: any) {
        this.config = config;
      }
      add = {
        container: (x: number, y: number, children?: any[]) =>
          new FakeContainer(this, x, y, children),
        rectangle: jest.fn(() => ({
          setOrigin: jest.fn().mockReturnThis(),
          setDepth: jest.fn().mockReturnThis(),
        })),
        image: jest.fn(() => ({
          setScrollFactor: jest.fn(),
        })),
        graphics: jest.fn(() => ({
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
        })),
        existing: jest.fn(),
      };
      cameras = {
        main: { setViewport: jest.fn() },
      };
      game = {
        scale: { width: 800, height: 600 },
      };
      time = {
        addEvent: jest.fn(),
      };
      // Minimal scene plugin stub
      scene: any = {
        isActive: jest.fn(),
        launch: jest.fn(),
        stop: jest.fn(),
        get: jest.fn(),
      };
    }
  
    // A fake class for Phaser.Game that is constructible
    class FakeGame {
      config: any;
      events: { on: jest.Mock };
      constructor(config: any) {
        this.config = config;
        // Provide a stub for events with an 'on' method
        this.events = { on: jest.fn() };
      }
    }
  
    // Minimal stub for Phaser.GameObjects.Container
    class FakeContainer {
      scene: any;
      x: number;
      y: number;
      children: any[];
      constructor(scene: any, x: number, y: number, children?: any[]) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.children = children || [];
      }
      setVisible(visible: boolean) {
        return this;
      }
      add(child: any) {
        this.children.push(child);
        return this;
      }
      destroy() {
      }
    }
  
    // Minimal stub for Phaser.GameObjects.Text
    class FakeText {
      scene: any;
      x: number;
      y: number;
      text: string;
      style: any;
      constructor(scene: any, x: number, y: number, text: string, style?: any) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.text = text;
        this.style = style;
      }
      setText(newText: string) {
        this.text = newText;
        return this;
      }
    }
  
    return {
      Scene: MockScene,
      Game: FakeGame,
      GameObjects: {
        Container: FakeContainer,
        Text: FakeText,
      },
      // Minimal stub for Phaser.Scale with required properties
      Scale: {
        FIT: 'FIT',
        CENTER_HORIZONTALLY: 'CENTER_HORIZONTALLY' 
      }
    };
  });
  
  // Import UxScene after mocking dependencies
  import Phaser from 'phaser';
  (global as any).Phaser = Phaser;
  
  // Now import the rest of your modules (they will use the global Phaser)
  import { UxScene } from '../../src/scenes/uxScene';
  import { Item } from '../../src/world/item';
  import { World } from '../../src/world/world';
  import { Interactions } from '../../src/world/controller';
  
  // Start of test suite
  const world = new World();
  beforeAll(() => {
    world.load({
      tiles: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ],
      terrain_types: [{ id: 0, name: 'Grass', walkable: true }],
      item_types: [
        {
          name: 'Cauldron',
          type: 'cauldron',
          carryable: false,
          walkable: false,
          interactions: []
        }
      ],
      mob_types: []
    });
  });
  
  // A helper function to patch a UxScene instance with the properties it needs
  function patchUxScene(uxScene: UxScene) {
    // Patch the mixContainer using a type assertion
    uxScene.mixContainer = { add: jest.fn() } as unknown as Phaser.GameObjects.Container;
    
    uxScene.scene = {
      isActive: jest.fn().mockReturnValue(false),
      launch: jest.fn(),
      stop: jest.fn(),
      get: jest.fn(() => ({ setBrewColor: jest.fn() })) as any,
    } as any;
  }
  
  describe('BrewScene actions based on state', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.clearAllTimers();
    });
  
    test('Toggle button appears when a cauldron is nearby', () => {
      const uxScene = new UxScene();
      patchUxScene(uxScene);
      
      // Create a cauldron item
      const cauldron = new Item(
        world,
        'cauldron',
        { x: 0, y: 0 },
        {
          name: 'Cauldron',
          type: 'cauldron',
          carryable: false,
          walkable: false,
          interactions: [],
          attributes: { potion_subtype: '123456' } as any
        }
      );
      
      // Interaction that uses the cauldron
      const interaction: Interactions = {
        item: cauldron,
        action: 'action',
        label: 'label'
      };
  
      uxScene.setBrewOptions([interaction]);
      
    //check that toggle button was created
      expect(uxScene.mixButtons.buttons.length).toEqual(1);
      
      // Confirm the texture of the button is 'Toggle Menu'
      const toggleButton = uxScene.mixButtons.buttons[0];
      expect(toggleButton.texture).toEqual('Toggle Menu');
    });
  
    test('Toggle button opens the brew scene', () => {
      const uxScene = new UxScene();
      patchUxScene(uxScene);
      // Ensure isActive returns false
      uxScene.scene.isActive = jest.fn().mockReturnValue(false);
      
      const cauldron = new Item(
        world,
        'cauldron',
        { x: 0, y: 0 },
        {
          name: 'Cauldron',
          type: 'cauldron',
          carryable: false,
          walkable: false,
          interactions: [],
          attributes: { potion_subtype: '654321' } as any
        }
      );
      
      const interaction: Interactions = {
        item: cauldron,
        action: 'no',
        label: 'label'
      };
      
      uxScene.setBrewOptions([interaction]);
      
      // Retrieve the toggle button
      const toggleButton = uxScene.mixButtons.buttons[0];
      
      // Simulate a button click 
      toggleButton.emit('pointerdown');
      
      // Because isActive returned false, the callback should call scene.launch('BrewScene')
      expect(uxScene.scene.launch).toHaveBeenCalledWith('BrewScene');
      
      // Advance timers so that the setTimeout callback is executed
      jest.runAllTimers();
    });
  });
  