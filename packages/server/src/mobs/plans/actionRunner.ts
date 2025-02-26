import { Mob } from '../mob';
import { mobFactory } from '../mobFactory';
import { Plan } from './plan';
import { PersonalityTraits } from '../traits/personality';

// Cache action sets by mob type
const actionSetCache: Record<string, Plan[]> = {};

// Cache selected actions with timeout
const selectedActionCache: Map<string, { action: Plan; expiresTick: number }> =
  new Map();
const ACTION_CACHE_DURATION = 30; // Cache actions for 30 ticks

export function selectAction(npc: Mob): Plan {
  const currentTick = npc.current_tick;
  const cached = selectedActionCache.get(npc.id);

  // Return cached action if still valid
  if (cached && cached.expiresTick > currentTick) {
    return cached.action;
  }

  // Get or create cached action set for this mob type
  if (!actionSetCache[npc.type]) {
    actionSetCache[npc.type] = mobFactory.getActionSet(npc);
  }
  const actions = actionSetCache[npc.type];

  // Find best action
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

  // Cache the selected action
  selectedActionCache.set(npc.id, {
    action: highestUtilityAction,
    expiresTick: currentTick + ACTION_CACHE_DURATION
  });

  return highestUtilityAction;
}
