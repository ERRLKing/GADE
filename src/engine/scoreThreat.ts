import type { UniversalAgentState } from '../schemas/agentState'

export function scoreThreat(state: UniversalAgentState): {
  level: 'none' | 'low' | 'medium' | 'high' | 'critical'
  score: number
  primarySource: string
} {
  let score = 0
  let primarySource = 'none'

  for (const entity of state.perception.entities) {
    const proximityFactor = entity.distance <= 25 ? 1 : entity.distance <= 75 ? 0.7 : entity.distance <= 150 ? 0.45 : 0.2
    const armedFactor = entity.armed ? 0.35 : 0.1
    const entityScore = Math.min(1, entity.threatScore * 0.6 + proximityFactor * 0.3 + armedFactor)
    if (entityScore > score) {
      score = entityScore
      primarySource = entity.type
    }
  }

  if (state.body.bleeding) score += 0.15
  if (state.body.health < 40) score += 0.15
  if (state.environment.visibility === 'low') score += 0.05
  if (state.positionContext.safetyRating < 0.3) score += 0.08

  score = Math.max(0, Math.min(1, score))

  let level: 'none' | 'low' | 'medium' | 'high' | 'critical' = 'none'
  if (score >= 0.85) level = 'critical'
  else if (score >= 0.65) level = 'high'
  else if (score >= 0.4) level = 'medium'
  else if (score > 0.05) level = 'low'

  return { level, score, primarySource }
}
