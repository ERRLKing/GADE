import { z } from 'zod'

export const reflectRequestSchema = z.object({
  agentId: z.string().min(1),
  events: z.array(z.object({
    type: z.string().min(1),
    summary: z.string().min(1).max(500),
    importance: z.number().min(0).max(1).default(0.5),
  })).min(1),
})

export const reflectResponseSchema = z.object({
  ok: z.boolean(),
  agentId: z.string(),
  storedEvents: z.number().int().min(0),
  longTermSummary: z.array(z.string()),
})

export type ReflectRequest = z.infer<typeof reflectRequestSchema>
export type ReflectResponse = z.infer<typeof reflectResponseSchema>
