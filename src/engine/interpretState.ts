import type { UniversalAgentState } from '../schemas/agentState'
import type { Assessment } from '../schemas/assessment'
import { scoreNeeds } from './scoreNeeds'
import { scoreThreat } from './scoreThreat'
import { scoreCombat } from './scoreCombat'

export function interpretState(state: UniversalAgentState): Assessment {
  const threatAssessment = scoreThreat(state)
  const needAssessment = scoreNeeds(state)
  const combatAssessment = scoreCombat(state, threatAssessment.score)

  return {
    threatAssessment,
    needAssessment,
    combatAssessment,
  }
}
