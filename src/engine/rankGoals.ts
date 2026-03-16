import type { CandidateGoal } from './buildCandidateGoals'

export function rankGoals(goals: CandidateGoal[]): CandidateGoal[] {
  return [...goals].sort((a, b) => b.priority - a.priority)
}
