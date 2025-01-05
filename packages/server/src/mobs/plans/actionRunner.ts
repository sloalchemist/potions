import { Mob } from '../mob';
import { mobFactory } from '../mobFactory';
import { Plan } from './plan';
import { PersonalityTraits } from '../traits/personality';

export function selectAction(npc: Mob): Plan {
  const actions = mobFactory.getActionSet(npc);

  let highestUtilityAction: Plan | undefined;
  let highestUtility = -Infinity;
  for (const action of actions) {
    const stubbornBonus =
      action.type() === npc.action
        ? npc.personality.traits[PersonalityTraits.Stubbornness]
        : 0;
    const utility = action.utility(npc) + stubbornBonus;

    if (utility > highestUtility) {
      highestUtility = utility;
      highestUtilityAction = action;
    }
  }
  if (!highestUtilityAction) {
    throw new Error('No action selected');
  }

  return highestUtilityAction;
}
