import { ItemGenerator } from '../../../src/items/itemGenerator';
import { commonSetup } from '../../testSetup';
import { DB } from '../../../src/services/database';
import { Item } from '../../../src/items/item';
import { BuildWall } from '../../../src/items/uses/building/buildWall';
import { Mob } from '../../../src/mobs/mob';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Pickup } from '../../../src/items/uses/pickup';

beforeAll(() => {
  commonSetup();
});

describe('Build wall from partial wall', () => {
  test('should build wall from partial wall', () => {
    const worldDescription = {
      tiles: [
        [-1, -1],
        [-1, -1]
      ],
      terrain_types: [],
      item_types: [
        {
          name: 'Log',
          description: 'A piece of wood',
          type: 'log',
          carryable: true,
          smashable: true,
          walkable: true,
          interactions: [
            {
              "description": "Build wall",
              "action": "build_wall",
              "while_carried": true,
              "requires_item": "partial-wall"
          }
          ],
          attributes: [],
          on_tick: []
        },
        {
          name: 'Partial Wall',
          description: 'A partially formed wall',
          type: 'partial-wall',
          carryable: false,
          walkable: false,
          interactions: [],
          attributes: [
            {
              "name": "complete",
              "value": 3
            }
          ]
        }
      ],
      mob_types: [
        {
          name: 'Villager',
          type: 'villager',
          speaker: true
        }
      ]
    };

    //generate world
    const itemGenerator = new ItemGenerator(worldDescription.item_types);
    const logPos = { x: 0, y: 0};
    itemGenerator.createItem({
      type: 'log',
      position: logPos
    });

    const wallPos = { x: 0, y: 1};
    itemGenerator.createItem({
      type: 'partial-wall',
      position: wallPos
    });
    
    const logId = Item.getItemIDAt(logPos);
    expect(logId).not.toBeNull();
    const log = Item.getItem(logId!);

    mobFactory.makeMob("villager", { x: 1, y: 0}, "test-villager")
   
    const mob = Mob.getMob("villager");
    expect(mob).toBeInstanceOf(Mob);

    //had to do this condition because mob&log could be Mob | undefined,
    // not sure if there's a better fix
    if (mob && log ) {
      const pickup = new Pickup;

      //does the pickup still happen if it is in an expect statement?
      expect(pickup.interact(mob, log)).toBeTruthy();

      //check that the mob is carrying something
      expect(mob.carrying).not.toBeNull();
      const buildWall = new BuildWall();
      const wallInteract = buildWall.interact(mob, log);

      expect(wallInteract).toBeTruthy();

    }
    
    //TODO: check coordinates to make sure there is not a partial wall!
    //expect there to be a wall at our coords

   
    
  });
});

afterAll(() => {
  DB.close();
});