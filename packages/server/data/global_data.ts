export const terrainTypes  = [
  {
    name: 'Dirt',
    id: 2,
    walkable: true
  },
  {
    name: 'Grass',
    id: 1,
    walkable: true
  },
  {
    name: 'Water',
    id: 51,
    walkable: false
  }
];

export const itemTypes = [
  {
    name: 'Heartbeet',
    type: 'heart-beet',
    description:
      'A vibrant red vegetable that is both nutritious and restorative.',
    attributes: [
      {
        name: 'brew_color',
        value: '#FF0000'
      },
      {
        name: 'health',
        value: 1
      }
    ],
    walkable: true,
    smashable: true,
    interactions: [
      {
        description: 'Brew red potion',
        action: 'brew',
        while_carried: true,
        requires_item: 'cauldron'
      },
      {
        description: 'Eat',
        action: 'eat',
        while_carried: true
      }
    ],
    carryable: true,
    on_tick: []
  },
  {
    name: 'Wall',
    type: 'wall',
    description:
      'A sturdy structure that blocks movement and provides protection.',
    carryable: false,
    smashable: true,
    attributes: [
      {
        name: 'health',
        value: 100
      }
    ],
    interactions: [],
    walkable: false,
    drops_item: 'log'
  },
  {
    name: 'Partial Wall',
    type: 'partial-wall',
    description:
      'An incomplete wall, requiring additional materials to finish.',
    carryable: false,
    walkable: false,
    smashable: true,
    attributes: [
      {
        name: 'complete',
        value: 3
      },
      {
        name: 'health',
        value: 1
      }
    ],
    interactions: [],
    drops_item: 'log'
  },
  {
    name: 'Fence',
    type: 'fence',
    description: 'A simple barrier to mark boundaries or restrict movement.',
    carryable: false,
    walkable: false,
    smashable: true,
    attributes: [
      {
        name: 'health',
        value: 100
      }
    ],
    interactions: [],
    drops_item: 'log'
  },
  {
    name: 'Gate',
    type: 'gate',
    description: 'A movable barrier allowing controlled entry.',
    carryable: false,
    walkable: true,
    smashable: true,
    attributes: [
      {
        name: 'health',
        value: 100
      }
    ],
    interactions: []
  },
  {
    name: 'Door',
    type: 'door',
    description: 'Just a door.',
    carryable: false,
    smashable: true,
    walkable: true,
    attributes: [
      {
        name: 'health',
        value: 100
      }
    ],
    interactions: []
  },
  {
    name: 'Tree',
    type: 'tree',
    description: 'A tall, woody plant that occasionally drops logs.',
    carryable: false,
    walkable: false,
    interactions: [],
    on_tick: [
      {
        action: 'spawn_item',
        parameters: {
          type: 'log',
          global_max: 10,
          local_max: 2,
          radius: 3,
          rate: 0.1
        }
      }
    ]
  },
  {
    type: 'heart-beet-plant',
    name: 'Heartbeet plant',
    description: 'A red root vegetable known for its restorative properties.',
    carryable: false,
    walkable: true,
    smashable: false,
    flat: true,
    interactions: [],
    on_tick: [
      {
        action: 'spawn_item',
        parameters: {
          type: 'heart-beet',
          global_max: 10,
          local_max: 2,
          radius: 3,
          rate: 0.1
        }
      }
    ]
  },
  {
    type: 'blueberry',
    name: 'Blueberry',
    description: 'A small, round fruit that grows in clusters on bushes.',
    carryable: true,
    walkable: true,
    smashable: true,
    attributes: [
      {
        name: 'brew_color',
        value: '#0000FF'
      },
      {
        name: 'health',
        value: 1
      }
    ],
    interactions: [
      {
        description: 'Brew blue potion',
        action: 'brew',
        while_carried: true,
        requires_item: 'cauldron'
      },
      {
        description: 'Eat',
        action: 'eat',
        while_carried: true
      }
    ]
  },
  {
    type: 'blueberry-bush',
    name: 'Blueberry bush',
    description: 'A shrub that produces small, sweet blueberries.',
    carryable: false,
    walkable: false,
    smashable: false,
    interactions: [],
    on_tick: [
      {
        action: 'spawn_item',
        parameters: {
          type: 'blueberry',
          global_max: 10,
          local_max: 2,
          radius: 3,
          rate: 0.1
        }
      }
    ]
  },
  {
    name: 'Log',
    type: 'log',
    carryable: true,
    smashable: true,
    walkable: true,
    flat: true,
    attributes: [
      {
        name: 'health',
        value: 1
      }
    ],
    interactions: [
      {
        description: 'Start wall',
        action: 'start_wall',
        while_carried: true
      },
      {
        description: 'Build wall',
        action: 'build_wall',
        while_carried: true,
        requires_item: 'partial-wall'
      }
    ]
  },
  {
    name: 'Portal',
    type: 'portal',
    description:
      'A magical gateway that spawns mobs and allows travel between locations.',
    carryable: false,
    walkable: true,
    flat: true,
    interactions: [],
    on_tick: [
      {
        action: 'spawn_mob',
        parameters: {
          type: 'blob',
          max: 1,
          rate: 0.1
        }
      },
      {
        action: 'spawn_mob',
        parameters: {
          type: 'fighter',
          max: 1,
          rate: 0.1
        }
      },
      {
        action: 'spawn_mob',
        parameters: {
          type: 'villager',
          max: 12,
          rate: 0.1
        }
      }
    ]
  },
  {
    name: 'Potion stand',
    description: 'A stand that sells health potions.',
    type: 'potion-stand',
    carryable: false,
    smashable: true,
    walkable: false,
    attributes: [
      {
        name: 'items',
        value: 0
      },
      {
        name: 'price',
        value: 10
      },
      {
        name: 'gold',
        value: 0
      },
      {
        name: 'health',
        value: 1
      }
    ],
    interactions: [
      {
        description: 'Add $item_name',
        action: 'add_item',
        while_carried: false
      },
      {
        description: 'Raise price',
        action: 'raise_price',
        while_carried: false,
        conditions: [
          {
            attribute_name: 'price',
            value: 99,
            comparison: 'less_than'
          }
        ]
      },
      {
        description: 'Lower price',
        action: 'lower_price',
        while_carried: false,
        conditions: [
          {
            attribute_name: 'price',
            value: 1,
            comparison: 'greater_than'
          }
        ]
      },
      {
        description: 'Collect gold',
        action: 'collect_gold',
        while_carried: false,
        conditions: [
          {
            attribute_name: 'gold',
            value: 0,
            comparison: 'greater_than'
          }
        ]
      },
      {
        description: 'Purchase potion',
        action: 'purchase',
        while_carried: false,
        conditions: [
          {
            attribute_name: 'items',
            value: 0,
            comparison: 'greater_than'
          }
        ]
      },
      {
        description: 'Destroy stand',
        action: 'destroy_stand',
        while_carried: false,
        conditions: [
          {
            attribute_name: 'items',
            value: 0,
            comparison: 'equals'
          }
        ]
      }
    ],
    show_price_at: {
      x: 7,
      y: -10
    }
  },
  {
    name: 'Potion',
    description: 'A magical concotion',
    type: 'potion',
    carryable: true,
    smashable: true,
    walkable: true,
    attributes: [
      {
        name: 'health',
        value: 1
      }
    ],
    interactions: [
      {
        description: 'Quaff potion',
        action: 'drink',
        while_carried: true
      },
      {
        description: 'Create stand',
        action: 'create_stand',
        while_carried: true
      }
    ]
  },
  {
    name: 'Basket',
    description: 'Stores items for the community.',
    type: 'basket',
    carryable: false,
    templated: true,
    walkable: false,
    show_template_at: {
      x: 0,
      y: 7
    },
    attributes: [
      {
        name: 'items',
        value: 0
      }
    ],
    interactions: [
      {
        description: 'Get $item_name',
        action: 'get_item',
        while_carried: false,
        conditions: [
          {
            attribute_name: 'items',
            value: 0,
            comparison: 'greater_than'
          }
        ]
      },
      {
        description: 'Add $item_name',
        action: 'add_item',
        while_carried: false
      }
    ]
  },
  {
    name: 'Cauldron',
    description: 'For mixing potions',
    type: 'cauldron',
    carryable: false,
    walkable: false,
    interactions: []
  },
  {
    name: 'Gold',
    description: 'money!!!',
    type: 'gold',
    walkable: true,
    smashable: false,
    carryable: true,
    interactions: []
  }
];

export const mobTypes = [
  {
    name: 'Blob',
    name_style: 'monstrous',
    type: 'blob',
    description: 'A slimy, aggressive creature known for its strong attacks.',
    health: 100,
    speed: 0.6,
    attack: 40,
    gold: 25,
    community: 'blobs',
    stubbornness: 20,
    bravery: 60,
    aggression: 80,
    industriousness: 40,
    adventurousness: 20,
    gluttony: 10,
    sleepy: 10,
    extroversion: 50
  },
  {
    name: 'Villager',
    name_style: 'norse-english',
    type: 'villager',
    description: 'A friendly inhabitant of the silverclaw community.',
    health: 10,
    speed: 0.5,
    attack: 5,
    gold: 0,
    community: 'silverclaw',
    stubbornness: 20,
    bravery: 5,
    aggression: 5,
    industriousness: 40,
    adventurousness: 10,
    gluttony: 50,
    sleepy: 80,
    extroversion: 50
  },
  {
    name: 'Player',
    description: 'The player',
    name_style: 'norse-english',
    type: 'player',
    health: 100,
    speed: 2.5,
    attack: 5,
    gold: 0,
    community: 'alchemists',
    stubbornness: 20,
    bravery: 5,
    aggression: 5,
    industriousness: 40,
    adventurousness: 10,
    gluttony: 50,
    sleepy: 80,
    extroversion: 50
  },
  {
    name: 'Fighter',
    name_style: 'french-roman',
    type: 'fighter',
    description: 'A brave combatant, loyal to the fighters guild.',
    speaker: true,
    health: 100,
    speed: 0.75,
    attack: 100,
    gold: 0,
    community: 'fighters',
    stubbornness: 20,
    bravery: 60,
    aggression: 80,
    industriousness: 40,
    adventurousness: 20,
    gluttony: 10,
    sleepy: 10,
    extroversion: 50
  }
];

export const communities = [
  {
    id: 'silverclaw',
    name: 'Village of the Silverclaw',
    description:
      'The Silverclaw Tribe, descendants of the silver-souled, known for their resilience and independence.'
  },
  {
    id: 'blobs',
    name: 'Blobby town',
    description: 'A small village of blobs.'
  },
  {
    id: 'fighters',
    name: 'Fighters guild',
    description: 'A small village of fighters.'
  },
  {
    id: 'alchemists',
    name: 'Alchemists guild',
    description:
      "The Alchemist's guild, a group of alchemists who study the primal colors and their effects."
  }
];

export const alliances = [
  ['silverclaw', 'fighters'],
  ['silverclaw', 'alchemists'],
  ['alchemists', 'fighters']
];
