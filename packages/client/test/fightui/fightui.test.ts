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
      {}
    );
    const npc1 = new Mob(
      world!,
      'mob2',
      'NPC1',
      'npc',
      100,
      { x: 2, y: 2 },
      {},
      {}
    );
    const mobs = [player1, npc1];
    const expectedFilteredMobs = [npc1];

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
      {}
    );
    const npc = new Mob(
      world!,
      'mob2',
      'NPC1',
      'npc',
      100,
      { x: 2, y: 2 },
      {},
      {}
    );
    const mobs = [player1, npc];

    setFighting(false);

    mobRangeListener(mobs);

    const expectedFilteredMobs = [npc];
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
      {}
    );
    const npc1 = new Mob(
      world!,
      'mob2',
      'NPC1',
      'npc',
      100,
      { x: 2, y: 2 },
      {},
      {}
    );
    let mobs = [player1, npc1];

    setFighting(false);
    mobRangeListener(mobs);

    const expectedFilteredMobs = [npc1];
    expect(mockFightCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    mockFightCallback.mockClear();

    // Add second mob
    const npc2 = new Mob(
      world!,
      'mob3',
      'NPC2',
      'npc',
      100,
      { x: 3, y: 3 },
      {},
      {}
    );
    mobs = [player1, npc1, npc2];
    mobRangeListener(mobs);

    const updatedFilteredMobs = [npc1, npc2];
    expect(mockFightCallback).toHaveBeenCalledWith(updatedFilteredMobs);
  });
});
