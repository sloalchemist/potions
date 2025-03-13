import {
  setChatting,
  setChatCompanionCallback,
  mobRangeListener
} from '../../src/world/controller';
import { Mob } from '../../src/world/mob';
import { World } from '../../src/world/world';

describe('Chat UI updates based on chatting state', () => {
  let world: World | null = null;
  let mockChatCallback: jest.Mock;

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
  });

  beforeEach(() => {
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

    mockChatCallback = jest.fn();
    setChatCompanionCallback(mockChatCallback);
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
    const npc1 = new Mob(
      world!,
      'mob2',
      'NPC1',
      'npc',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    const mobs = [player1, npc1];
    const expectedFilteredMobs = [npc1];

    mobRangeListener(mobs);

    // start chatting
    setChatting(true);

    // conversation ends
    setChatting(false);
    mobRangeListener(mobs);

    setChatting(true);

    setChatting(false);
    mobRangeListener(mobs);

    expect(mockChatCallback).toHaveBeenCalledTimes(3);
    expect(mockChatCallback).toHaveBeenCalledWith(expectedFilteredMobs);
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
    const npc = new Mob(
      world!,
      'mob2',
      'NPC1',
      'npc',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    const mobs = [player1, npc];

    setChatting(false);

    mobRangeListener(mobs);

    const expectedFilteredMobs = [npc];
    expect(mockChatCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    mockChatCallback.mockClear();
    mobRangeListener(mobs);

    expect(mockChatCallback).not.toHaveBeenCalled();
  });

  test('should not trigger callback if the blob added', () => {
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
    const npc = new Mob(
      world!,
      'mob2',
      'NPC1',
      'npc',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    const mobs = [player1, npc];

    setChatting(false);

    mobRangeListener(mobs);

    const expectedFilteredMobs = [npc];
    expect(mockChatCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    mockChatCallback.mockClear();

    const blob = new Mob(
      world!,
      'mob3',
      'BLOB1',
      'blob',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );

    const new_mobs = [player1, npc, blob];

    mobRangeListener(new_mobs);

    expect(mockChatCallback).not.toHaveBeenCalled();
  });

  test('should update chat companions when a second mob enters range', () => {
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
    const npc1 = new Mob(
      world!,
      'mob2',
      'NPC1',
      'npc',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    let mobs = [player1, npc1];

    setChatting(false);
    mobRangeListener(mobs);

    const expectedFilteredMobs = [npc1];
    expect(mockChatCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    mockChatCallback.mockClear();

    // Add second mob
    const npc2 = new Mob(
      world!,
      'mob3',
      'NPC2',
      'npc',
      100,
      { x: 3, y: 3 },
      {},
      {},
      {}
    );
    mobs = [player1, npc1, npc2];
    mobRangeListener(mobs);

    const updatedFilteredMobs = [npc1, npc2];
    expect(mockChatCallback).toHaveBeenCalledWith(updatedFilteredMobs);
  });

  test('Chattable attribute affects chat options', () => {
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
    const npc1 = new Mob(
      world!,
      'mob2',
      'NPC1',
      'npc',
      100,
      { x: 2, y: 2 },
      {},
      {},
      {}
    );
    let mobs = [player1, npc1];

    setChatting(false);
    mobRangeListener(mobs);

    const expectedFilteredMobs = [npc1];
    expect(mockChatCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    player1.chattable = true;

    mockChatCallback.mockClear();
    setChatting(false);
    mobRangeListener(mobs);
    expect(mockChatCallback).toHaveBeenCalledWith(mobs);
  });

  afterAll(() => {
    world = null;
  });
});
