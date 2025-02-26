//Silence Eslint errors due to global Phaser
/* eslint-disable @typescript-eslint/no-explicit-any, 
   @typescript-eslint/no-unsafe-function-type,
 */

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
      public interactionSound?: string;

      constructor(
        scene: any,
        x: number,
        y: number,
        enabled: boolean,
        texture: string,
        callback: Function,
        width?: number,
        height?: number,
        interactionSound?: string
      ) {
        this.scene = scene;
        this.x = x;
        this.y = y;
        this.enabled = enabled;
        this.texture = texture;
        this.callback = callback;
        this.width = width;
        this.height = height;
        this.interactionSound = interactionSound;
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
        setDepth: jest.fn().mockReturnThis()
      })),
      image: jest.fn(() => ({
        setScrollFactor: jest.fn()
      })),
      graphics: jest.fn(() => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis()
      })),
      existing: jest.fn()
    };
    cameras = {
      main: { setViewport: jest.fn() }
    };
    game = {
      scale: { width: 800, height: 600 }
    };
    time = {
      addEvent: jest.fn()
    };
    // Minimal scene plugin stub
    scene: any = {
      isActive: jest.fn(),
      launch: jest.fn(),
      stop: jest.fn(),
      get: jest.fn()
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
    setVisible() {
      return this;
    }
    add(child: any) {
      this.children.push(child);
      return this;
    }
    destroy() {}
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

  const createMockBrewScene = () => {
    class MockBrewScene {
      brewColor = 0x9eb9d4;
      numIngredients = 0;

      setBrewColor(color: number) {
        this.brewColor = color;
      }

      setNumIngredients(num: number) {
        this.numIngredients = num;
      }

      create() {}

      add = {
        graphics: jest.fn(() => ({
          fillStyle: jest.fn().mockReturnThis(),
          fillRect: jest.fn().mockReturnThis(),
          clear: jest.fn().mockReturnThis(),
          setTint: jest.fn().mockReturnThis()
        }))
      };
    }
    return MockBrewScene;
  };

  return {
    Scene: MockScene,
    Game: FakeGame,
    GameObjects: {
      Container: FakeContainer,
      Text: FakeText,
      Graphics: jest.fn(() => ({
        fillStyle: jest.fn().mockReturnThis(),
        fillRect: jest.fn().mockReturnThis(),
        clear: jest.fn().mockReturnThis(),
        setTint: jest.fn().mockReturnThis()
      }))
    },
    Scale: {
      FIT: 'FIT',
      CENTER_HORIZONTALLY: 'CENTER_HORIZONTALLY'
    },
    BrewScene: createMockBrewScene(),
    createMockBrewScene: createMockBrewScene
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
  uxScene.itemsContainer = {
    add: jest.fn()
  } as unknown as Phaser.GameObjects.Container;

  uxScene.scene = {
    isActive: jest.fn().mockReturnValue(false),
    launch: jest.fn(),
    stop: jest.fn(),
    get: jest.fn(() => ({
      setBrewColor: jest.fn(),
      setNumIngredients: jest.fn()
    })) as any
  } as any;

  const MockBrewScene = (Phaser as any).createMockBrewScene();
  uxScene.scene.get = jest.fn(() => new MockBrewScene());

  // Add a fake cache property with an audio object.
  uxScene.cache = {
    audio: {
      has: jest.fn((_: string) => true)
    }
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

    uxScene.setInteractions([interaction]);

    //check that toggle button was created
    expect(uxScene.interactButtons.buttons.length).toEqual(1);

    // Confirm the texture of the button is 'Toggle Menu'
    const toggleButton = uxScene.interactButtons.buttons[0];
    expect(toggleButton.texture).toEqual('Craft Potion');
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

    uxScene.setInteractions([interaction]);

    // Retrieve the toggle button
    const toggleButton = uxScene.interactButtons.buttons[0];

    // Simulate a button click
    toggleButton.emit('pointerdown');

    // Because isActive returned false, the callback should call scene.launch('BrewScene')
    expect(uxScene.scene.launch).toHaveBeenCalledWith('BrewScene');

    // Advance timers so that the setTimeout callback is executed
    jest.runAllTimers();
  });

  test('Brew scene stops when there is no cauldron nearby', () => {
    const uxScene = new UxScene();
    patchUxScene(uxScene);
    // Ensure isActive returns true
    uxScene.scene.isActive = jest.fn().mockReturnValue(true);

    const blueberry = new Item(
      world,
      'blueberry',
      { x: 1, y: 0 },
      {
        name: 'Blueberry',
        type: 'blueberry',
        carryable: true,
        walkable: true,
        interactions: []
      }
    );

    const interactions: Interactions[] = [
      {
        item: blueberry,
        action: 'ew',
        label: 'label'
      }
    ];

    uxScene.setInteractions(interactions);

    // Because isActive returned true, the callback should call scene.stop('BrewScene')
    expect(uxScene.scene.stop).toHaveBeenCalledWith('BrewScene');

    // Advance timers so that the setTimeout callback is executed
    jest.runAllTimers();
  });
});

describe('Buttons shown when BrewScene is and is not active', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });
  afterEach(() => {
    jest.clearAllTimers();
  });

  test('Active BrewScene shows brew options', () => {
    const uxScene = new UxScene();
    patchUxScene(uxScene);
    // Ensure isActive returns true
    uxScene.scene.isActive = jest.fn().mockReturnValue(true);

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

    const blueberry = new Item(
      world,
      'blueberry',
      { x: 1, y: 0 },
      {
        name: 'Blueberry',
        type: 'blueberry',
        carryable: true,
        walkable: true,
        interactions: []
      }
    );

    const interactions: Interactions[] = [
      {
        item: cauldron,
        action: 'action',
        label: 'cooked'
      },
      {
        item: blueberry,
        action: 'munch',
        label: 'label'
      }
    ];

    uxScene.setInteractions(interactions);

    //check that the buttons were created
    expect(uxScene.interactButtons.buttons.length).toEqual(2);

    // Confirm the texture of the first button is 'cooked'
    const blueberryButton = uxScene.interactButtons.buttons[0];
    expect(blueberryButton.texture).toEqual('cooked');

    // Confirm the texture of the second button is 'Toggle Menu'
    const toggleButton = uxScene.interactButtons.buttons[1];
    expect(toggleButton.texture).toEqual('Finish Crafting');

    // Advance timers so that the setTimeout callback is executed
    jest.runAllTimers();
  });

  test('Inactive BrewScene shows brew options', () => {
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

    const blueberry = new Item(
      world,
      'blueberry',
      { x: 1, y: 0 },
      {
        name: 'Blueberry',
        type: 'blueberry',
        carryable: true,
        walkable: true,
        interactions: []
      }
    );

    const interactions: Interactions[] = [
      {
        item: cauldron,
        action: 'no',
        label: 'label'
      },
      {
        item: blueberry,
        action: 'action',
        label: 'omnom'
      }
    ];

    uxScene.setInteractions(interactions);

    //check that the buttons were created
    expect(uxScene.interactButtons.buttons.length).toEqual(2);

    // Confirm the texture of the first button is 'omnom'
    const blueberryButton = uxScene.interactButtons.buttons[0];
    expect(blueberryButton.texture).toEqual('omnom');

    // Confirm the texture of the second button is 'Toggle Menu'
    const toggleButton = uxScene.interactButtons.buttons[1];
    expect(toggleButton.texture).toEqual('Craft Potion');
  });
});

describe('Check BrewScene Defaults', () => {
  let brewScene: any;

  beforeEach(() => {
    brewScene = new UxScene();
    patchUxScene(brewScene);
  });

  test('Test default color is 0x9eb9d4', () => {
    brewScene.scene.get().create();
    expect(brewScene.scene.get().brewColor).toBe(0x9eb9d4);
  });

  test('Test default num Ingredients is 0', () => {
    brewScene.scene.get().create();
    expect(brewScene.scene.get().numIngredients).toBe(0);
  });
});
