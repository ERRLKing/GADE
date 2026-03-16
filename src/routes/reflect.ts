import { Router } from 'express'
import { reflectRequestSchema, reflectResponseSchema } from '../schemas/memory'
import { insertMemoryEvent, upsertLongTermSummary } from '../memory/memoryStore'
import { summarizeMemory } from '../memory/summarizeMemory'

export const reflectRouter = Router()

reflectRouter.post('/', (req, res) => {
  const parsed = reflectRequestSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid reflect payload', details: parsed.error.flatten() })
  }

  const { agentId, events } = parsed.data
  for (const event of events) {
    insertMemoryEvent(agentId, event.type, event.summary, event.importance)
  }

  const longTermSummary = summarizeMemory(agentId)
  upsertLongTermSummary(agentId, longTermSummary)

  const response = reflectResponseSchema.parse({
    ok: true,
    agentId,
    storedEvents: events.length,
    longTermSummary,
  })

  return res.json(response)
})
