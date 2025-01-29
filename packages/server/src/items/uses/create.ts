import { Mob } from '../../mobs/mob';
import { Item } from '../item';
import { itemGenerator } from '../itemGenerator';

export class Create {
    static createItemFrom(createItem: Item, creator: Mob, type: string): boolean {
        itemGenerator.createItem({
        type: type,
        subtype: createItem.subtype,
        position: creator.position,
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
