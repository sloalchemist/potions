import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { itemGenerator } from '../itemGenerator';
import { Community } from '../../community/community';

export class Create {
  static createItemFrom(createItem: Item, creator: Mob, type: string): boolean {
    const creatorCommunity = Community.getVillage(creator.community_id);
    let typeAttribute = {
      templateType: createItem.type,
      items: 1,
      capacity: 20
    };

    // There should be no potion count for no potions
    if (createItem.type === 'log') {
      typeAttribute.items = 0;
    }

    itemGenerator.createItem({
      type: type,
      subtype: createItem.subtype,
      position: creator.position,
      ownedByCommunity: creatorCommunity,
      ownedByCharacter: creator.id,
      attributes: typeAttribute
    });

    createItem.destroy();
    return true;
  }
}
