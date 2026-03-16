"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reflectRouter = void 0;
const express_1 = require("express");
const memory_1 = require("../schemas/memory");
const memoryStore_1 = require("../memory/memoryStore");
const summarizeMemory_1 = require("../memory/summarizeMemory");
exports.reflectRouter = (0, express_1.Router)();
exports.reflectRouter.post('/', (req, res) => {
    const parsed = memory_1.reflectRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid reflect payload', details: parsed.error.flatten() });
    }
    const { agentId, events } = parsed.data;
    for (const event of events) {
        (0, memoryStore_1.insertMemoryEvent)(agentId, event.type, event.summary, event.importance);
    }
    const longTermSummary = (0, summarizeMemory_1.summarizeMemory)(agentId);
    (0, memoryStore_1.upsertLongTermSummary)(agentId, longTermSummary);
    const response = memory_1.reflectResponseSchema.parse({
        ok: true,
        agentId,
        storedEvents: events.length,
        longTermSummary,
    });
    return res.json(response);
});
