import { commonSetup, itemGenerator, world} from '../../testSetup';
import { DB } from '../../../src/services/database';
import { Item } from '../../../src/items/item';
import { BuildWall } from '../../../src/items/uses/building/buildWall';
import { Mob } from '../../../src/mobs/mob';
import { mobFactory } from '../../../src/mobs/mobFactory';
import { Pickup } from '../../../src/items/uses/pickup';
import { Community } from '../../../src/community/community';

beforeAll(() => {
  commonSetup();
  Community.makeVillage("alchemists", "Alchemists guild");
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Build wall from partial wall', () => {
  test('should (1) create mob, partial wall, and log ' +
  '(2) mob interact with partial wall while carrying log ' +
  '(3) wall should replace partial wall', () => {    
    //create items in desired locations
    const logPos = { x: 0, y: 0 };
    itemGenerator.createItem({
      type: 'log',
      position: logPos
    });
    const logId = Item.getItemIDAt(logPos);
    expect(logId).not.toBeNull();
    const log = Item.getItem(logId!);
    expect(log).toBeDefined();

    const wallPos = { x: 0, y: 1 };
    itemGenerator.createItem({
      type: 'partial-wall',
      position: wallPos
    });


    mobFactory.makeMob('player', { x: 1, y: 0 }, '1234', 'testPlayer1');
    const mob = Mob.getMob('1234');
    expect(mob).toBeInstanceOf(Mob);
    expect(mob).toBeDefined();
    expect(log).toBeDefined();

    if (mob && log) {
      const pickup = new Pickup();
      expect(pickup.interact(mob, log)).toBeTruthy();
      
      //check that the mob is carrying something
      expect(mob.carrying).toBeDefined();

      //interact with partial wall to create wall
      const buildWall = new BuildWall();
      const wallInteract = buildWall.interact(mob, log);
      expect(wallInteract).toBeTruthy();

      //make sure something is at the partial wall location
      const oldPartialWallID = Item.getItemIDAt(wallPos);
      expect(oldPartialWallID).not.toBeNull();
      const itemAtWallPos = Item.getItem(oldPartialWallID!);
      expect(itemAtWallPos).not.toBeNull();

      //make sure item is a wall and not partial wall
      expect(itemAtWallPos!.type).toBe('wall');
    }
  });
});

afterAll(() => {
  DB.close();
});
