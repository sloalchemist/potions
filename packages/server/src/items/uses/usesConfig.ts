// actionsConfig.ts
import { Pickup } from './pickup';
import { Drop } from './drop';
import { Stash } from './stash';
import { Unstash } from './unstash';
import { Smash } from './smash';
import { BottlePotion } from './cauldron/bottlePotion';
import { Drink } from './drink';
import { Eat } from './eat';
import { EnterPortal } from './enterPortal';
import { Purchase } from './stand/purchase';
import { CollectGold } from './stand/collectGold';
import { CreateStand } from './stand/createStand';
import { CreateMarket } from './marketstand/createMarket';
import { RaisePrice } from './stand/raisePrice';
import { LowerPrice } from './stand/lowerPrice';
import { DestroyStand } from './stand/destroyStand';
import { DestroyMarketStand } from './marketstand/destroyMarketStand';
import { RaiseMarketPrice } from './marketstand/RaiseMarketPrice';
import { LowerMarketPrice } from './marketstand/LowerMarketPrice';
import { PurchaseFromMarket } from './marketstand/purchaseFromMarket';
import { AddItemToMarket } from './marketstand/addItemToMarket';
import { BuildWall } from './building/buildWall';
import { StartWall } from './building/startWall';
import { AddItem } from './container/addItem';
import { GetItem } from './container/getItem';
import { Give } from './give';
import { AddIngredient } from './cauldron/addIngredient';
import { DumpCauldron } from './cauldron/dumpCauldron';
import { Use } from './use';
import { Read } from './read';

const uses = [
  Pickup,
  Drop,
  Stash,
  Unstash,
  Smash,
  BottlePotion,
  Drink,
  Eat,
  EnterPortal,
  Purchase,
  CollectGold,
  CreateStand,
  DestroyStand,
  DestroyMarketStand,
  CreateMarket,
  RaisePrice,
  LowerPrice,
  RaiseMarketPrice,
  LowerMarketPrice,
  PurchaseFromMarket,
  AddItemToMarket,
  BuildWall,
  StartWall,
  AddItem,
  GetItem,
  Give,
  AddIngredient,
  DumpCauldron,
  Read
] as const satisfies readonly (new () => Use)[];

export default uses;
