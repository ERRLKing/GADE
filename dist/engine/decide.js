"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decide = decide;
const fallbackDecision_1 = require("./fallbackDecision");
const validateDecision_1 = require("./validateDecision");
const buildDecisionPrompt_1 = require("../llm/buildDecisionPrompt");
const callModel_1 = require("../llm/callModel");
const parseModelJson_1 = require("../llm/parseModelJson");
const decision_1 = require("../schemas/decision");
const shouldUseStrategicPlanner_1 = require("./shouldUseStrategicPlanner");
async function decide(state, assessment) {
    const mode = process.env.ENGINE_MODE || 'hybrid';
    const model = process.env.MODEL_NAME || 'gpt-5';
    console.log('[decide] start', {
        mode,
        model,
        agentId: state.agent.id,
        agentName: state.agent.name,
    });
    const shouldPlan = (0, shouldUseStrategicPlanner_1.shouldUseStrategicPlanner)(state, assessment);
    if (!shouldPlan) {
        console.log('[decide] skipping strategic LLM plan this cycle; using deterministic planner');
        const fallback = (0, fallbackDecision_1.fallbackDecision)(state, assessment);
        return {
            ...fallback,
            constraints: fallback.constraints.length >= 8
                ? [...fallback.constraints.slice(0, 7), 'source:strategic-skip']
                : [...fallback.constraints, 'source:strategic-skip'],
        };
    }
    if (mode === 'deterministic') {
        console.log('[decide] deterministic mode active, using fallbackDecision');
        return (0, fallbackDecision_1.fallbackDecision)(state, assessment);
    }
    try {
        const prompt = (0, buildDecisionPrompt_1.buildDecisionPrompt)(state, assessment);
        console.log('[decide] calling LLM now');
        const raw = await (0, callModel_1.callModel)(prompt);
        console.log('[decide] raw model text received', {
            preview: raw.slice(0, 300),
        });
        const json = (0, parseModelJson_1.parseModelJson)(raw);
        console.log('[decide] parsed model json', {
            json,
        });
        const parsed = decision_1.decisionSchema.parse(json);
        const validation = (0, validateDecision_1.validateDecision)(state, parsed);
        if (validation.ok) {
            console.log('[decide] LLM decision accepted', {
                intent: parsed.intent,
                priority: parsed.priority,
                style: parsed.style,
            });
            return {
                ...parsed,
                constraints: parsed.constraints.length >= 8
                    ? [...parsed.constraints.slice(0, 7), 'source:openai']
                    : [...parsed.constraints, 'source:openai'],
            };
        }
        console.warn('[decide] LLM decision failed validation, using fallback', {
            validation,
        });
    }
    catch (error) {
        console.error('[decide] LLM failed, using fallback', {
            error: error instanceof Error ? error.message : String(error),
        });
    }
    const fallback = (0, fallbackDecision_1.fallbackDecision)(state, assessment);
    console.log('[decide] fallback decision returned', {
        intent: fallback.intent,
        priority: fallback.priority,
        style: fallback.style,
    });
    return {
        ...fallback,
        constraints: fallback.constraints.length >= 8
            ? [...fallback.constraints.slice(0, 7), 'source:fallback']
            : [...fallback.constraints, 'source:fallback'],
    };
}
