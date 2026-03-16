import { z } from 'zod'

export const assessmentSchema = z.object({
  threatAssessment: z.object({
    level: z.enum(['none', 'low', 'medium', 'high', 'critical']),
    score: z.number().min(0).max(1),
    primarySource: z.string(),
  }),
  needAssessment: z.object({
    food: z.number().min(0).max(1),
    water: z.number().min(0).max(1),
    medical: z.number().min(0).max(1),
    rest: z.number().min(0).max(1),
    warmth: z.number().min(0).max(1),
  }),
  combatAssessment: z.object({
    confidence: z.number().min(0).max(1),
    recommendedStance: z.enum(['avoid', 'observe', 'defensive', 'engage']),
  }),
})

export type Assessment = z.infer<typeof assessmentSchema>
