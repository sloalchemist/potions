import { getInteractablePhysicals } from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('When on top of a non-walkable item, only one interaction is returned', () => {
  let world: World | null = null;

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

  test('On top of partial wall, only one interaction is returned', () => {
    const partialWallType: ItemType = {
      name: 'Partial Wall',
      type: 'partial-wall',
      carryable: false,
      smashable: true,
      walkable: false,
      interactions: [],
      attributes: [
        {
          name: 'health',
          value: 1
        },
        {
          name: 'complete',
          value: 3
        }
      ]
    };

    // Instantiate the partial wall object
    const partialWall = new Item(
      world!,
      'partial-wall',
      { x: 1, y: 1 },
      partialWallType
    );
    const playerPos: Coord = { x: 1, y: 1 };

    // Put partial wall into Item list form to be accepted as an input for getInteractablePhysicals
    const physicals: Item[] = [partialWall];

    // Get interactable objects from the player position
    const interactablePhysicals = getInteractablePhysicals(
      physicals,
      playerPos
    );

    // Determine if the partial wall object appears as an interactable object
    const partialWallExists = interactablePhysicals.some(
      (item) => item.itemType.name === 'Partial Wall'
    );

    // There should only be one interactable object
    expect(partialWallExists).toBe(true);
    expect(interactablePhysicals.length).toBe(1);
  });

  afterAll(() => {
    world = null;
  });
});
