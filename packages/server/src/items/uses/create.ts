import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { itemGenerator } from '../itemGenerator';
import { Community } from '../../community/community';

export class Create {
  static createItemFrom(createItem: Item, creator: Mob, type: string): boolean {
    const creatorCommunity = Community.getVillage(creator.community_id);
    itemGenerator.createItem({
      type: type,
      subtype: createItem.subtype,
      position: creator.position,
      ownedBy: creatorCommunity,
      attributes: {
        templateType: createItem.type,
        items: 1,
        capacity: 20
      }
    });

    createItem.destroy();
    return true;
  }
}
