import {
  getInteractablePhysicals,
  getPhysicalInteractions
} from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('Openable, smashable items have prompts to smash', () => {
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
  });

  test('Proximity to gate results in "smash gate" prompt', () => {
    const gateItemType: ItemType = {
      name: 'Gate',
      type: 'gate',
      item_group: 'fence',
      layout_type: 'opens',
      carryable: false,
      smashable: true,
      walkable: true,
      interactions: [],
      attributes: [
        {
          name: 'health',
          value: 100
        }
      ]
    };

    //const player1 = new Mob(world!, 'mob1', 'Player1', 'player', 100, playerPos, 2, {});

    // Instantiate the gate object
    const gate = new Item(world!, 'gate1', { x: 1, y: 1 }, gateItemType);

    // Establish player position (don't need a full player mob)
    const playerPos: Coord = { x: 1, y: 0 };

    // Put gate into Item list form to be accepted as an input for getInteractablePhysicals
    const physicals: Item[] = [gate];

    // Get physicals (should just be gate) that are able to be interacted with
    // from the player position
    const interactablePhysicals = getInteractablePhysicals(
      physicals,
      playerPos
    );

    // Determine if the gate object appears as an interactable object
    const gateExists = interactablePhysicals.some(
      (item) => item.itemType.name === 'Gate'
    );

    expect(gateExists).toBe(true);
    console.log('Interactable items in proximity: ', interactablePhysicals);

    // Acquire all of the possible interactions with the gate object
    const interactions = getPhysicalInteractions(gate);

    // Determine if the smash interaction is possible with the gate object
    const hasSmashInteraction = interactions.some(
      (interaction) => interaction.action === 'smash'
    );
    expect(hasSmashInteraction).toBe(true);
    console.log('Interactions available: ', interactions);
  });

  test('Proximity to door results in "smash door" prompt', () => {
    const gateItemType: ItemType = {
      name: 'Door',
      type: 'door',
      item_group: 'wall',
      layout_type: 'opens',
      carryable: false,
      smashable: true,
      walkable: true,
      interactions: [],
      attributes: [
        {
          name: 'health',
          value: 100
        }
      ]
    };

    // Instantiate the door object
    const door = new Item(world!, 'door1', { x: 1, y: 1 }, gateItemType);

    // Establish player position (don't need a full player mob)
    const playerPos: Coord = { x: 1, y: 0 };

    // Put door into Item list form to be accepted as an input for getInteractablePhysicals
    const physicals: Item[] = [door];

    // Get physicals (should just be door) that are able to be interacted with
    // from the player position
    const interactablePhysicals = getInteractablePhysicals(
      physicals,
      playerPos
    );

    // Determine if the door object appears as an interactable object
    const doorExists = interactablePhysicals.some(
      (item) => item.itemType.name === 'Door'
    );

    expect(doorExists).toBe(true);
    console.log('Interactable items in proximity: ', interactablePhysicals);

    // Acquire all of the possible interactions with the door object
    const interactions = getPhysicalInteractions(door);

    // Determine if the smash interaction is possible with the door object
    const hasSmashInteraction = interactions.some(
      (interaction) => interaction.action === 'smash'
    );
    expect(hasSmashInteraction).toBe(true);
    console.log('Interactions available: ', interactions);
  });

  afterAll(() => {
    world = null;
  });
});
