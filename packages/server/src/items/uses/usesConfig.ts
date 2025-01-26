// actionsConfig.ts
import { Pickup } from './pickup';
import { Drop } from './drop';
import { Smash } from './smash';
import { Brew } from './cauldron/brew';
import { Drink } from './drink';
import { Eat } from './eat';
import { EnterPortal } from './enterPortal';
import { Purchase } from './stand/purchase';
import { CollectGold } from './stand/collectGold';
import { CreateStand } from './stand/createStand';
import { RaisePrice } from './stand/raisePrice';
import { LowerPrice } from './stand/lowerPrice';
import { BuildWall } from './building/buildWall';
import { StartWall } from './building/startWall';
import { AddItem } from './container/addItem';
import { GetItem } from './container/getItem';
import { Give } from './give';
import { AddIngredient } from './cauldron/addIngredient';
import { DumpCauldron } from './cauldron/dumpCauldron';

const uses = [
  Pickup,
  Drop,
  Smash,
  Brew,
  Drink,
  Eat,
  EnterPortal,
  Purchase,
  CollectGold,
  CreateStand,
  RaisePrice,
  LowerPrice,
  BuildWall,
  StartWall,
  AddItem,
  GetItem,
  Give,
  AddIngredient,
  DumpCauldron
];

export default uses;
