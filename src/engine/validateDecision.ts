import type { Decision } from '../schemas/decision'
import type { UniversalAgentState } from '../schemas/agentState'

export function validateDecision(state: UniversalAgentState, decision: Decision): { ok: boolean; reasons: string[] } {
  const reasons: string[] = []

  if (!state.actionSpace.includes(decision.intent)) {
    reasons.push(`Intent ${decision.intent} is not in actionSpace.`)
  }

  if (decision.intent === 'ENGAGE_TARGET' && (!state.capabilities.canUseWeapons || state.equipment.weapons.length === 0)) {
    reasons.push('Cannot engage target without weapon capability or available weapon.')
  }

  if (decision.intent === 'HEAL_SELF' && !state.capabilities.canHeal) {
    reasons.push('Cannot heal without healing capability.')
  }

  if (decision.intent === 'LOOT_NEARBY_STRUCTURE' && !state.capabilities.canLoot) {
    reasons.push('Cannot loot without loot capability.')
  }

  return { ok: reasons.length === 0, reasons }
}
