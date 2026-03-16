"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reactRouter = void 0;
const express_1 = require("express");
const agentState_1 = require("../schemas/agentState");
const interpretState_1 = require("../engine/interpretState");
const react_1 = require("../engine/react");
const decision_1 = require("../schemas/decision");
const memoryStore_1 = require("../memory/memoryStore");
exports.reactRouter = (0, express_1.Router)();
exports.reactRouter.post('/', (req, res) => {
    const parsed = agentState_1.universalAgentStateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            error: 'Invalid agent state payload',
            details: parsed.error.flatten(),
        });
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
    const reaction = (0, react_1.react)(mergedState, assessment);
    if (!reaction) {
        return res.json({
            assessment,
            reaction: null,
            shouldEscalateToStrategic: true,
        });
    }
    const validated = decision_1.decisionSchema.parse(reaction);
    return res.json({
        assessment,
        reaction: {
            ...validated,
            constraints: validated.constraints.length >= 8
                ? [...validated.constraints.slice(0, 7), 'source:react']
                : [...validated.constraints, 'source:react'],
        },
        shouldEscalateToStrategic: false,
    });
});
