import type { Assessment } from '../schemas/assessment'
import type { Decision } from '../schemas/decision'
import type { UniversalAgentState } from '../schemas/agentState'
import { fallbackDecision } from './fallbackDecision'
import { validateDecision } from './validateDecision'
import { buildDecisionPrompt } from '../llm/buildDecisionPrompt'
import { callModel } from '../llm/callModel'
import { parseModelJson } from '../llm/parseModelJson'
import { decisionSchema } from '../schemas/decision'
import { shouldUseStrategicPlanner } from './shouldUseStrategicPlanner'

export async function decide(state: UniversalAgentState, assessment: Assessment): Promise<Decision> {
  const mode = process.env.ENGINE_MODE || 'hybrid'
  const model = process.env.MODEL_NAME || 'gpt-5'

  console.log('[decide] start', {
    mode,
    model,
    agentId: state.agent.id,
    agentName: state.agent.name,
  })

  const shouldPlan = shouldUseStrategicPlanner(state, assessment)

  if (!shouldPlan) {
    console.log('[decide] skipping strategic LLM plan this cycle; using deterministic planner')
    const fallback = fallbackDecision(state, assessment)

    return {
      ...fallback,
      constraints:
        fallback.constraints.length >= 8
          ? [...fallback.constraints.slice(0, 7), 'source:strategic-skip']
          : [...fallback.constraints, 'source:strategic-skip'],
    }
  }

  if (mode === 'deterministic') {
    console.log('[decide] deterministic mode active, using fallbackDecision')
    return fallbackDecision(state, assessment)
  }

  try {
    const prompt = buildDecisionPrompt(state, assessment)

    console.log('[decide] calling LLM now')

    const raw = await callModel(prompt)

    console.log('[decide] raw model text received', {
      preview: raw.slice(0, 300),
    })

    const json = parseModelJson<Decision>(raw)

    console.log('[decide] parsed model json', {
      json,
    })

    const parsed = decisionSchema.parse(json)

    const validation = validateDecision(state, parsed)

    if (validation.ok) {
      console.log('[decide] LLM decision accepted', {
        intent: parsed.intent,
        priority: parsed.priority,
        style: parsed.style,
      })

      return {
        ...parsed,
        constraints:
          parsed.constraints.length >= 8
            ? [...parsed.constraints.slice(0, 7), 'source:openai']
            : [...parsed.constraints, 'source:openai'],
      }
    }

    console.warn('[decide] LLM decision failed validation, using fallback', {
      validation,
    })
  } catch (error) {
    console.error('[decide] LLM failed, using fallback', {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  const fallback = fallbackDecision(state, assessment)

  console.log('[decide] fallback decision returned', {
    intent: fallback.intent,
    priority: fallback.priority,
    style: fallback.style,
  })

  return {
    ...fallback,
    constraints:
      fallback.constraints.length >= 8
        ? [...fallback.constraints.slice(0, 7), 'source:fallback']
        : [...fallback.constraints, 'source:fallback'],
  }
}
