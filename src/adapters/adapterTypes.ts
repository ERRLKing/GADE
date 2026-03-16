import type { Decision } from '../schemas/decision'
import type { UniversalAgentState } from '../schemas/agentState'

export interface GameAdapter {
  normalize(rawState: unknown): UniversalAgentState
  execute(decision: Decision): Promise<void>
}
