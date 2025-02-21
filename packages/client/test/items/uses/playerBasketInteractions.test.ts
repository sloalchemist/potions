import {
  getPhysicalInteractions
} from '../../../src/world/controller';
import { Item } from '../../../src/world/item';
import { World } from '../../../src/world/world';
import { Mob } from '../../../src/world/mob';
import { ItemType } from '../../../src/worldDescription';
import { Coord } from '@rt-potion/common';

describe('Community ownership based interactions', () => {
  let world: World | null = null;
  let basket: Item;
  let log: Item;
  let player: Mob;
  let playerPos: Coord;

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

    // Put player in world to allow controller to test client side permissions
    const publicCharacterId = '11111';
    playerPos = { x: 1, y: 0 };
    player = new Mob(
      world,
      publicCharacterId,
      'player1',
      'player',
      100,
      playerPos,
      {},
      {},
      'alchemists'
    );
    world.mobs[publicCharacterId] = player;
    world.addMobToGrid(player);

    // Create basket ItemType
    const basketItemType: ItemType = {
      name: 'Basket',
      type: 'basket',
      carryable: false,
      templated: true,
      walkable: false,
      show_template_at: {
            "x": 0,
            "y": 7
        },
      interactions: [
        {
          description: "Get $item_name",
          action: "get_item",
          while_carried: false,
          conditions: [
            {
              attribute_name: "items",
              value: 0,
              comparison: "greater_than"
            }
          ]
        },
        {
          description: "Add $item_name",
          action: "add_item",
          while_carried: false,
          permissions: {
              "community": true,
              "other": false
          }
        }
      ],
      attributes: []
    };

    // Instantiate basket object
    basket = new Item(
      world!,
      'basket',
      { x: 1, y: 1 },
      basketItemType,
      'silverclaw'
    );
    
    // Manually assign basket template type
    basket.attributes.templateType = "Log";

    // Create log ItemType
    const logItemType: ItemType = {
        name: 'Log',
        type: 'log',
        item_group: 'fence',
        layout_type: 'opens',
        carryable: true,
        smashable: true,
        walkable: true,
        flat: true,
        attributes: [
            {
                name: "health",
                value: 1
            }
        ],
        interactions: [
            {
                description: "Start wall",
                action: "start_wall",
                while_carried: true
            },
            {
                description: "Build wall",
                action: "build_wall",
                while_carried: true,
                requires_item: "partial-wall"
            }
        ]
      };
  
      // Instantiate log object
      log = new Item(world!, 'log1', { x: 1, y: 2 }, logItemType);
  });

  
  test('Should prevent community members from adding items to basket if not affiliated', () => {
    // Get interactions available for the basket
    const interactions = getPhysicalInteractions(
      basket,
      log,
      player.community_id
    );

    // Check that add_item is NOT an available interaction
    expect(
      interactions.some((interaction) => interaction.action === 'add_item')
    ).toBe(false);
  });

  test('Should allow community members to add items to basket if affiliated', () => {
    // Get interactions available for the basket (now owned by alchemists to match the player)
    basket.ownedBy = "alchemists"
    const interactions = getPhysicalInteractions(
      basket,
      log,
      player.community_id
    );

    // Check that add_item IS an available interaction
    expect(
      interactions.some((interaction) => interaction.action === 'add_item')
    ).toBe(true);
  });

  afterAll(() => {
    world = null;
  });
});
