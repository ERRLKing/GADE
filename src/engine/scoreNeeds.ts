import type { UniversalAgentState } from '../schemas/agentState'

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

export function scoreNeeds(state: UniversalAgentState) {
  return {
    food: clamp01(state.body.hunger / 100),
    water: clamp01(state.body.thirst / 100),
    medical: clamp01((100 - state.body.health) / 100 + (state.body.bleeding ? 0.35 : 0)),
    rest: clamp01(state.body.fatigue / 100 + (100 - state.body.stamina) / 200),
    warmth: clamp01((50 - state.body.temperature) / 50),
  }
}
