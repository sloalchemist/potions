import { commonSetup, world, itemGenerator } from '../testSetup';
import { DB } from '../../src/services/database';
import { mobFactory } from '../../src/mobs/mobFactory';
import { Community } from '../../src/community/community';
import { Item } from '../../src/items/item';
import { AddItem } from '../../src/items/uses/container/addItem';
import { GetItem } from '../../src/items/uses/container/getItem';
import { Mob } from '../../src/mobs/mob';
import { Coord } from '@rt-potion/common';
// import { findCommunity } from '../../../converse/src/library/converse';

beforeEach(() => {
  commonSetup();
  Community.makeVillage('alchemists', 'Alchemists guild');
  Community.makeVillage('silverclaw', 'Blacksmith guild');
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
        // ownedBy: 'silverclaw',
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

      // console.log(findCommunity('silverclaw'))

      // create a potion (owned by blacksmiths) and give it to blacksmith
      itemGenerator.createItem({
        type: 'potion',
        subtype: '255',
        position: potionLocation,
        carriedBy: blacksmithPlayer
      });
      const potion = Item.getItemIDAt(potionLocation);
      expect(potion).not.toBeNull();
      const potionItem = Item.getItem(potion!);
      expect(potionItem).not.toBeNull();

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
      console.log("Before Alchemist retrieves potion, stand items:", potionStand!.getAttribute("items"));
      const retrievePotionAlchemist = new GetItem();
      const resultAlchemist = retrievePotionAlchemist.interact(alchemistPlayer!, potionStand!);
      console.log("After Alchemist retrieves potion, stand items:", potionStand!.getAttribute("items"));
      console.log("Alchemist retrieval result:", resultAlchemist);
      expect(potionStand!.getAttribute('items')).toBe(1);
      expect(resultAlchemist).toBe(false);

      // create a potion (owned by alchemists) and give it to alchemist
      itemGenerator.createItem({
        type: 'potion',
        subtype: '255',
        position: potionLocation,
        carriedBy: alchemistPlayer
      });

      // alchemist
      const addPotionAlchemist = new GetItem();
      addPotionAlchemist.interact(alchemistPlayer!, potionStand!);
      expect(potionStand!.getAttribute('items')).toBe(1); // Verify the potion is now on the stand
      expect(blacksmithPlayer!.carrying).toBeUndefined(); // Verify Blacksmith is not carrying anything



      // test raisePrice


      // test lowerPrice


      // test collectGold 


    });
  });
});

afterEach(() => {
  DB.close();
});
