import { Router } from 'express'
import { universalAgentStateSchema } from '../schemas/agentState'
import { interpretState } from '../engine/interpretState'
import { decide } from '../engine/decide'
import { decisionSchema } from '../schemas/decision'
import { getLongTermSummary } from '../memory/memoryStore'

export const decideRouter = Router()

decideRouter.post('/', async (req, res) => {
  const parsed = universalAgentStateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid agent state payload', details: parsed.error.flatten() })
  }

  const state = parsed.data
  const persistedSummary = getLongTermSummary(state.agent.id)
  const mergedState = {
    ...state,
    memory: {
      ...state.memory,
      longTerm: persistedSummary.length > 0 ? persistedSummary : state.memory.longTerm,
    },
  }

  const assessment = interpretState(mergedState)
  const plan = await decide(mergedState, assessment)
  const validated = decisionSchema.parse(plan)

  return res.json({ assessment, plan: validated })
})
