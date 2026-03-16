"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateRouter = void 0;
const express_1 = require("express");
const agentState_1 = require("../schemas/agentState");
const interpretState_1 = require("../engine/interpretState");
exports.evaluateRouter = (0, express_1.Router)();
exports.evaluateRouter.post('/', (req, res) => {
    const parsed = agentState_1.universalAgentStateSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid agent state payload', details: parsed.error.flatten() });
    }
    const assessment = (0, interpretState_1.interpretState)(parsed.data);
    return res.json(assessment);
});
