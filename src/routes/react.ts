import { Router } from 'express'
import { universalAgentStateSchema } from '../schemas/agentState'
import { interpretState } from '../engine/interpretState'
import { react } from '../engine/react'
import { decisionSchema } from '../schemas/decision'
import { getLongTermSummary } from '../memory/memoryStore'

export const reactRouter = Router()

reactRouter.post('/', (req, res) => {
  const parsed = universalAgentStateSchema.safeParse(req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid agent state payload',
      details: parsed.error.flatten(),
    })
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
  const reaction = react(mergedState, assessment)

  if (!reaction) {
    return res.json({
      assessment,
      reaction: null,
      shouldEscalateToStrategic: true,
    })
  }

  const validated = decisionSchema.parse(reaction)

  return res.json({
    assessment,
    reaction: {
      ...validated,
      constraints:
        validated.constraints.length >= 8
          ? [...validated.constraints.slice(0, 7), 'source:react']
          : [...validated.constraints, 'source:react'],
    },
    shouldEscalateToStrategic: false,
  })
})
