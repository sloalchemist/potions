import {
  setFighting,
  setFightOpponentCallback,
  mobRangeListener
} from '../../src/world/controller';
import { Mob } from '../../src/world/mob';
import { World } from '../../src/world/world';

jest.mock('../../src/scenes/pauseScene', () => ({
  PauseScene: class MockPauseScene {}
}));

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

const mockFightCallback: jest.Mock = jest.fn();

describe('Fight UI updates based on fighting state', () => {
  let world: World | null = null;

  beforeAll(() => {
    // Initialize world
    world = new World();
    world.load({
      tiles: [
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0]
      ],
      terrain_types: [{ id: 0, name: 'Grass', walkable: true }],
      item_types: [],
      mob_types: []
    });

    setFightOpponentCallback(mockFightCallback);
  });

  test('triggers callback after chatting', () => {
    const player1 = new Mob(
      world!,
      'mob1',
      'Player1',
      'player',
      100,
      { x: 1, y: 1 },
      {},
      {},
      {}
    );
    const blob1 = new Mob(
      world!,
      'mob2',
      'Blob1',
      'blob',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    const mobs = [player1, blob1];
    const expectedFilteredMobs = [blob1];

    mobRangeListener(mobs);

    // start chatting
    setFighting(true);

    // conversation ends
    setFighting(false);
    mobRangeListener(mobs);

    setFighting(true);

    setFighting(false);
    mobRangeListener(mobs);

    expect(mockFightCallback).toHaveBeenCalledTimes(3);
    expect(mockFightCallback).toHaveBeenCalledWith(expectedFilteredMobs);
  });

  test('should not trigger callback if the nearby mobs does not change', () => {
    const player1 = new Mob(
      world!,
      'mob1',
      'Player1',
      'player',
      100,
      { x: 1, y: 1 },
      {},
      {},
      {}
    );
    const blob1 = new Mob(
      world!,
      'mob2',
      'Blob1',
      'blob',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    const mobs = [player1, blob1];

    setFighting(false);

    mobRangeListener(mobs);

    const expectedFilteredMobs = [blob1];
    expect(mockFightCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    mockFightCallback.mockClear();
    mobRangeListener(mobs);

    expect(mockFightCallback).not.toHaveBeenCalled();
  });

  test('should update fight opponents when a second mob enters range', () => {
    const player1 = new Mob(
      world!,
      'mob1',
      'Player1',
      'player',
      100,
      { x: 1, y: 1 },
      {},
      {},
      {}
    );
    const blob1 = new Mob(
      world!,
      'mob2',
      'Blob1',
      'blob',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    let mobs = [player1, blob1];

    setFighting(false);
    mobRangeListener(mobs);

    const expectedFilteredMobs = [blob1];
    expect(mockFightCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    mockFightCallback.mockClear();

    // Add second mob
    const blob2 = new Mob(
      world!,
      'mob3',
      'Blob2',
      'blob',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    mobs = [player1, blob1, blob2];
    mobRangeListener(mobs);

    const updatedFilteredMobs = [blob1, blob2];
    expect(mockFightCallback).toHaveBeenCalledWith(updatedFilteredMobs);
  });

  test('Fightable attribute affects mobRangeListener ', () => {
    const player1 = new Mob(
      world!,
      'mob1',
      'Player1',
      'player',
      100,
      { x: 1, y: 1 },
      {},
      {},
      {}
    );
    const blob1 = new Mob(
      world!,
      'mob2',
      'Blob1',
      'blob',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    let mobs = [player1, blob1];

    setFighting(false);
    mobRangeListener(mobs);

    const expectedFilteredMobs = [blob1];
    expect(mockFightCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    mockFightCallback.mockClear();

    player1.fightable = true;
    mobRangeListener(mobs);

    const updatedFilteredMobs = [player1, blob1];
    expect(mockFightCallback).toHaveBeenCalledWith(updatedFilteredMobs);
  });
});
