import { z } from 'zod'

export const actionNameSchema = z.enum([
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
])

export const universalAgentStateSchema = z.object({
  agent: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    archetype: z.string().min(1),
    traits: z.object({
      aggression: z.number().min(0).max(1),
      caution: z.number().min(0).max(1),
      greed: z.number().min(0).max(1),
      curiosity: z.number().min(0).max(1),
      loyalty: z.number().min(0).max(1),
      panic: z.number().min(0).max(1),
    }),
  }),
  body: z.object({
    health: z.number().min(0).max(100),
    stamina: z.number().min(0).max(100),
    hunger: z.number().min(0).max(100),
    thirst: z.number().min(0).max(100),
    temperature: z.number().min(0).max(100),
    bleeding: z.boolean(),
    fatigue: z.number().min(0).max(100),
  }),
  equipment: z.object({
    weapons: z.array(z.object({
      name: z.string().min(1),
      ammoLoaded: z.number().int().min(0),
      reserveAmmo: z.number().int().min(0),
      effectiveRange: z.number().min(0),
    })),
    medical: z.array(z.string()),
    food: z.array(z.string()),
    tools: z.array(z.string()),
    clothing: z.array(z.string()),
  }),
  environment: z.object({
    biome: z.string(),
    weather: z.string(),
    lightLevel: z.string(),
    cover: z.string(),
    visibility: z.string(),
    noiseLevel: z.string(),
  }),
  positionContext: z.object({
    regionType: z.string(),
    safetyRating: z.number().min(0).max(1),
    pointsOfInterest: z.array(z.object({
      type: z.string(),
      distance: z.number().min(0),
      direction: z.string(),
    })),
  }),
  perception: z.object({
    entities: z.array(z.object({
      type: z.string(),
      relation: z.string(),
      distance: z.number().min(0),
      direction: z.string(),
      armed: z.boolean(),
      count: z.number().int().min(1),
      threatScore: z.number().min(0).max(1),
    })),
    events: z.array(z.object({
      type: z.string(),
      ageSeconds: z.number().min(0),
      direction: z.string(),
      intensity: z.string(),
    })),
  }),
  memory: z.object({
    shortTerm: z.array(z.string()),
    longTerm: z.array(z.string()),
  }),
  capabilities: z.object({
    canMove: z.boolean(),
    canLoot: z.boolean(),
    canHeal: z.boolean(),
    canUseWeapons: z.boolean(),
    canHide: z.boolean(),
    canInteract: z.boolean(),
    canCraft: z.boolean(),
  }),
  actionSpace: z.array(actionNameSchema).min(1),
  currentPlan: z.object({
    intent: z.string(),
    ageSeconds: z.number().min(0),
    status: z.string(),
  }),
})

export type UniversalAgentState = z.infer<typeof universalAgentStateSchema>
export type ActionName = z.infer<typeof actionNameSchema>
