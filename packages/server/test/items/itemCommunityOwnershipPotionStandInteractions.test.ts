import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { GetItem } from '../../src/items/uses/container/getItem';
import { Mob } from '../../src/mobs/mob';
import { Coord } from '@rt-potion/common';
import { RaisePrice }  from '../../src/items/uses/stand/raisePrice';
import { LowerPrice }  from '../../src/items/uses/stand/lowerPrice';
import { CollectGold }  from '../../src/items/uses/stand/collectGold';
import { Purchasable } from '../../src/items/purchasable'

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('silverclaw', 'Village of the Silverclaw');
  mobFactory.loadTemplates(world.mobTypes);
});

describe('Potion Stand Ownership Tests', () => {
  describe('Potion Stand Ownership and Community ID Tests', () => {
  test('Blacksmith can place potion, retrieve it, but Alchemist can not since wrong community', () => {

      const standPosition: Coord = { x: 0, y: 1 };
      const playerPosition: Coord = { x: 0, y: 0 };
      const potionLocation: Coord = { x: 1, y: 0 };

      // create potion stand (owned by Blacksmith community)
      itemGenerator.createItem({
        type: 'potion-stand',
        subtype: '255',
        position: standPosition,
        ownedBy: new Community('silverclaw', 'Village of the Silverclaw'),
        attributes: {
          templateType: 'potion',
          items: 0,
          capacity: 20
        },
      });
      const standID = Item.getItemIDAt(standPosition);
      expect(standID).not.toBeNull();
      const potionStand = Item.getItem(standID!);
      expect(potionStand).toBeDefined();

      // create Blacksmith community player
      mobFactory.makeMob('villager', playerPosition, 'BlacksmithID', 'BlacksmithPlayer');
      const blacksmithPlayer = Mob.getMob('BlacksmithID');
      expect(blacksmithPlayer).toBeDefined();
      expect(blacksmithPlayer!.carrying).toBeUndefined();          
      expect(blacksmithPlayer!.community_id).toBe('silverclaw');

       // create Alchemist community player
      mobFactory.makeMob('player', playerPosition, 'AlchemistID', 'AlchemistPlayer');
      const alchemistPlayer = Mob.getMob('AlchemistID');
      expect(alchemistPlayer).toBeDefined();
      expect(alchemistPlayer!.carrying).toBeUndefined(); 
      expect(alchemistPlayer!.community_id).toBe('alchemists');

      // create a potion (owned by blacksmiths) and give it to blacksmith
      itemGenerator.createItem({
        type: 'potion',
        subtype: '255',
        position: potionLocation,
        carriedBy: blacksmithPlayer,
        attributes: {
          price: 10
        }
      });

      // Blacksmith places potion on stand
      const addPotion = new AddItem();
      addPotion.interact(blacksmithPlayer!, potionStand!);
      expect(potionStand!.getAttribute('items')).toBe(1); // Verify the potion is now on the stand
      expect(blacksmithPlayer!.carrying).toBeUndefined(); // Verify Blacksmith is not carrying anything

      // Blacksmith retrieves potion from stand
      const retrievePotion = new GetItem();
      const resultBlacksmith = retrievePotion.interact(blacksmithPlayer!, potionStand!);
      expect(resultBlacksmith).toBe(true);
      expect(potionStand!.getAttribute('items')).toBe(0); // Verify the stand is empty
      expect(blacksmithPlayer!.carrying).not.toBeNull(); // Verify Blacksmith now has the potion
      expect(blacksmithPlayer!.carrying!.type).toBe('potion');   

      // Blacksmith replaces potion on stand
      const replacePotion = new AddItem();
      replacePotion.interact(blacksmithPlayer!, potionStand!);
      expect(potionStand!.getAttribute('items')).toBe(1); // Verify the potion is now on the stand
      expect(blacksmithPlayer!.carrying).toBeUndefined(); // Verify Blacksmith is not carrying anything

      // Alchemist fails to retrieve potion (since blacksmiths own stand)
      const retrievePotionAlchemist = new GetItem();
      const resultAlchemist = retrievePotionAlchemist.interact(alchemistPlayer!, potionStand!);
      expect(potionStand!.getAttribute('items')).toBe(1);
      expect(resultAlchemist).toBe(false); 


      // Alchemist can not raise price (start from 10)
      const alchemistRaise = new RaisePrice();
      const resultAlchemistRaise = alchemistRaise.interact(alchemistPlayer!, potionStand!);
      expect(potionStand!.getAttribute('price')).toBe(10); // price should stay the same
      expect(resultAlchemistRaise).toBe(false); 
      
      // Blacksmith can raise price (start from 10)
      const blacksmithRaise = new RaisePrice();
      const resultBlacksmithRaise= blacksmithRaise.interact(blacksmithPlayer!, potionStand!);
      expect(potionStand!.getAttribute('price')).toBe(11); // 10 + 1
      expect(resultBlacksmithRaise).toBe(true); 

      // Alchemist can not lowerPrice (start from 11)
      const alchemistLower = new LowerPrice();
      const resultAlchemistLower = alchemistLower.interact(alchemistPlayer!, potionStand!);
      expect(potionStand!.getAttribute('price')).toBe(11); // stay the same (11)
      expect(resultAlchemistLower).toBe(false);

      // Blacksmith can lower price (start from 11)
      const blacksmithLower = new LowerPrice();
      const resultBlacksmithLower = blacksmithLower.interact(blacksmithPlayer!, potionStand!);
      expect(potionStand!.getAttribute('price')).toBe(10); // 11 - 1
      expect(resultBlacksmithLower).toBe(true);


      // test collectGold 


    });
  });
});

afterEach(() => {
  DB.close();
});
