import type { UniversalAgentState } from '../schemas/agentState'

export function scoreCombat(state: UniversalAgentState, threatScore: number) {
  const bestWeapon = state.equipment.weapons[0]
  const hasWeapon = state.capabilities.canUseWeapons && Boolean(bestWeapon)
  const ammoScore = bestWeapon ? Math.min(1, (bestWeapon.ammoLoaded + bestWeapon.reserveAmmo) / 20) : 0
  const healthScore = state.body.health / 100
  const confidence = Math.max(0, Math.min(1, (hasWeapon ? 0.35 : 0) + ammoScore * 0.25 + healthScore * 0.25 + (1 - threatScore) * 0.15))

  const recommendedStance: 'avoid' | 'observe' | 'defensive' | 'engage' =
    confidence >= 0.75 ? 'engage' : confidence >= 0.55 ? 'defensive' : confidence >= 0.35 ? 'observe' : 'avoid'

  return { confidence, recommendedStance }
}
