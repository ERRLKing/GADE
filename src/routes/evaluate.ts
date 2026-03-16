import { Router } from 'express'
import { universalAgentStateSchema } from '../schemas/agentState'
import { interpretState } from '../engine/interpretState'

export const evaluateRouter = Router()

evaluateRouter.post('/', (req, res) => {
  const parsed = universalAgentStateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid agent state payload', details: parsed.error.flatten() })
  }

  const assessment = interpretState(parsed.data)
  return res.json(assessment)
})
