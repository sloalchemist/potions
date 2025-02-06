import { itemGenerator } from './itemGenerator';
import { Mob } from '../mobs/mob';
import { Item } from './item';

export class Market {
        
    private itemlist: Item[];
    private itemquantity: Number[];

    private constructor() {
        this.itemlist = [];
        this.itemquantity = [];
    }

    static fromItem(item: Item): Market | undefined {
        /*
        This should be irrelevant
        if (item.hasAttribute('items') && item.hasAttribute('templateType')) {
        return new Market(item);
        }
        */
        return undefined;
    }
    
    getType(): string {
        // return this.item.getAttribute('templateType');
        return "This is a fucking market you imbicile"
    }

    // there is a problem here, looking for number
    // unsure if this is right. It probably assumes that this is a market of a given type
    getInventory(): number {
        // do a list traversal of this shit and run it
        return ;
    }

    // Item stand cap.
    // This should be the total number of entries that are used.
    getCapacity(): number {
        return 10;
    }

    placeItem(mob: Mob): boolean {
        const carriedItem = mob.carrying;

        if (carriedItem && carriedItem.type === this.getType()) {
        if (carriedItem.subtype != this.item.subtype) {
            return false;
        }
        carriedItem.destroy();
        this.item.changeAttributeBy('items', 1);

        return true;
        }

        return false;
    }

    retrieveItem(mob: Mob): boolean {
        if (this.getInventory() <= 0) {
        return false;
        }

        this.item.changeAttributeBy('items', -1);

        itemGenerator.createItem({
        type: this.getType(),
        subtype: this.item.subtype,
        carriedBy: mob
        });

        return true;
    }
}
