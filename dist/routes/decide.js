"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.decideRouter = void 0;
const express_1 = require("express");
const agentState_1 = require("../schemas/agentState");
const interpretState_1 = require("../engine/interpretState");
const decide_1 = require("../engine/decide");
const decision_1 = require("../schemas/decision");
const memoryStore_1 = require("../memory/memoryStore");
exports.decideRouter = (0, express_1.Router)();
exports.decideRouter.post('/', async (req, res) => {
    const parsed = agentState_1.universalAgentStateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid agent state payload', details: parsed.error.flatten() });
    }
    const state = parsed.data;
    const persistedSummary = (0, memoryStore_1.getLongTermSummary)(state.agent.id);
    const mergedState = {
        ...state,
        memory: {
            ...state.memory,
            longTerm: persistedSummary.length > 0 ? persistedSummary : state.memory.longTerm,
        },
    };
    const assessment = (0, interpretState_1.interpretState)(mergedState);
    const plan = await (0, decide_1.decide)(mergedState, assessment);
    const validated = decision_1.decisionSchema.parse(plan);
    return res.json({ assessment, plan: validated });
});
