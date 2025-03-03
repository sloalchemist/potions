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

    // Set the expected order based on distance
    const expectedFilteredMobs = [npc1];

    mobRangeListener(mobs);

    setChatting(true); // Start chatting

    setChatting(false); // Conversation ends
    mobRangeListener(mobs);

    setChatting(true);

    setChatting(false);
    mobRangeListener(mobs);

    // Expect callback to be called 3 times and check the closest mobs
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

    // Expected closest mob (based on distance from player)
    const expectedFilteredMobs = [npc];
    expect(mockChatCallback).toHaveBeenCalledWith(expectedFilteredMobs);

    mockChatCallback.mockClear();
    mobRangeListener(mobs);

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

    // The expected order after sorting by distance (npc1 is closest)
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

    // Expected order: npc1, npc2 (sorted by distance)
    const updatedFilteredMobs = [npc1, npc2];
    expect(mockChatCallback).toHaveBeenCalledWith(updatedFilteredMobs);
  });

  afterAll(() => {
    world = null;
  });
});
