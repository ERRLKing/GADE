import type { Assessment } from '../schemas/assessment'
import type { Decision } from '../schemas/decision'
import type { UniversalAgentState } from '../schemas/agentState'
import { buildCandidateGoals } from './buildCandidateGoals'
import { rankGoals } from './rankGoals'

function nearestPoi(state: UniversalAgentState, type?: string) {
  const points = type
    ? state.positionContext.pointsOfInterest.filter((poi) => poi.type === type)
    : state.positionContext.pointsOfInterest
  return [...points].sort((a, b) => a.distance - b.distance)[0]
}

export function fallbackDecision(state: UniversalAgentState, assessment: Assessment): Decision {
  const ranked = rankGoals(buildCandidateGoals(state, assessment))
  const top = ranked[0]?.intent ?? 'MOVE_TO_POINT'
  const armedThreat = state.perception.entities.find((e) => e.armed)
  const structure = nearestPoi(state, 'structure') ?? nearestPoi(state)
  const water = nearestPoi(state, 'water_source')

  switch (top) {
    case 'RETREAT':
    case 'AVOID_ENTITY':
      return {
        intent: 'AVOID_ENTITY',
        priority: 'safety',
        style: state.agent.traits.caution >= 0.7 ? 'very_cautious' : 'cautious',
        target: {
          type: armedThreat?.type ?? 'threat',
          direction: 'away_from_target',
          preferredDistance: 120,
        },
        subgoals: ['break_line_of_sight', 'maintain_cover', 'reduce_noise'],
        constraints: ['do_not_engage_without_advantage', 'abort_if_surrounded'],
        durationSeconds: 30,
        reasoningSummary: 'Threat is too high to justify contact, so the safest choice is to disengage.',
      }
    case 'HEAL_SELF':
      return {
        intent: 'HEAL_SELF',
        priority: 'medical',
        style: 'urgent',
        target: {
          type: 'safe_cover',
          direction: 'nearest',
          distance: 15,
        },
        subgoals: ['reach_cover', 'stabilize', 'reassess'],
        constraints: ['heal_only_if_temporarily_safe'],
        durationSeconds: 20,
        reasoningSummary: 'The agent should stabilize before continuing any broader objective.',
      }
    case 'SEARCH_FOR_FOOD':
      return {
        intent: structure && state.actionSpace.includes('LOOT_NEARBY_STRUCTURE') ? 'LOOT_NEARBY_STRUCTURE' : 'SEARCH_FOR_FOOD',
        priority: 'food',
        style: 'cautious',
        target: {
          type: structure?.type ?? 'supply_area',
          direction: structure?.direction ?? 'forward',
          distance: structure?.distance ?? 100,
        },
        subgoals: ['prioritize_food', 'stay_near_cover', 'scan_before_entry'],
        constraints: ['avoid_open_ground_when_possible'],
        durationSeconds: 90,
        reasoningSummary: 'Food need is urgent, so the agent should search the nearest viable supply location.',
      }
    case 'SEARCH_FOR_WATER':
      return {
        intent: 'SEARCH_FOR_WATER',
        priority: 'water',
        style: 'cautious',
        target: {
          type: water?.type ?? 'water_source',
          direction: water?.direction ?? 'search_nearby',
          distance: water?.distance ?? 250,
        },
        subgoals: ['locate_water', 'approach_safely', 'leave_quickly'],
        constraints: ['avoid_staying_exposed_at_source'],
        durationSeconds: 100,
        reasoningSummary: 'Water need is becoming too strong to ignore.',
      }
    case 'ENGAGE_TARGET':
      return {
        intent: 'ENGAGE_TARGET',
        priority: 'combat',
        style: 'controlled',
        target: {
          type: armedThreat?.type ?? 'hostile',
          direction: armedThreat?.direction ?? 'forward',
          distance: armedThreat?.distance ?? 50,
        },
        subgoals: ['maintain_advantage', 'avoid_overcommitment'],
        constraints: ['disengage_if_outnumbered'],
        durationSeconds: 20,
        reasoningSummary: 'The agent appears capable enough to contest the threat if needed.',
      }
    case 'OBSERVE_AREA':
      return {
        intent: 'OBSERVE_AREA',
        priority: 'exploration',
        style: 'cautious',
        target: {
          type: 'observation_point',
          direction: 'forward',
          distance: 30,
        },
        subgoals: ['watch_for_threats', 'identify_resources'],
        constraints: ['avoid_needless_noise'],
        durationSeconds: 25,
        reasoningSummary: 'Observation can improve the next decision with less risk than immediate commitment.',
      }
    default:
      return {
        intent: 'MOVE_TO_POINT',
        priority: 'exploration',
        style: 'balanced',
        target: {
          type: 'low_risk_area',
          direction: 'forward',
          distance: 80,
        },
        subgoals: ['keep_moving', 'maintain_cover'],
        constraints: ['avoid_needless_conflict'],
        durationSeconds: 45,
        reasoningSummary: 'No single pressure dominates, so controlled movement is the best default.',
      }
  }
}
