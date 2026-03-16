import { z } from 'zod'

export const decisionSchema = z.object({
  intent: z.enum([
    'MOVE_TO_POINT',
    'LOOT_NEARBY_STRUCTURE',
    'HIDE',
    'AVOID_ENTITY',
    'ENGAGE_TARGET',
    'HEAL_SELF',
    'SEARCH_FOR_FOOD',
    'SEARCH_FOR_WATER',
    'OBSERVE_AREA',
    'RETREAT',
    'INTERACT',
    'CRAFT',
  ]),
  priority: z.enum(['survival', 'safety', 'food', 'water', 'medical', 'exploration', 'combat', 'social']),
  style: z.string().min(1).max(50),
  target: z.object({
    type: z.string().min(1),
    direction: z.string().min(1),
    preferredDistance: z.number().min(0).max(10000).optional(),
    distance: z.number().min(0).max(10000).optional(),
  }),
  subgoals: z.array(z.string()).max(8),
  constraints: z.array(z.string()).max(8),
  durationSeconds: z.number().int().min(5).max(600),
  reasoningSummary: z.string().min(1).max(600),
})

export type Decision = z.infer<typeof decisionSchema>
