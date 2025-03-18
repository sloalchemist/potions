import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { itemGenerator } from '../itemGenerator';
import { Community } from '../../community/community';

type ItemAttributes = Record<string, string | number>;

export class Create {
  static createItemFrom(createItem: Item, creator: Mob, type: string): boolean {
    const creatorCommunity = Community.getVillage(creator.community_id);
    let typeAttribute: ItemAttributes = {
      templateType: createItem.type,
      items: createItem.type === 'log' ? 0 : 1,
      capacity: 20
    };

    // Initialize market stand specific attributes
    // Markets start with 0 items while potions start with 1
    if (type === 'market-stand') {
      typeAttribute = {
        ...typeAttribute,
        items: 0,
        inventory: JSON.stringify({}),
        prices: JSON.stringify({})
      };
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
