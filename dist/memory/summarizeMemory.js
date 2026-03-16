"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeMemory = summarizeMemory;
const memoryStore_1 = require("./memoryStore");
function summarizeMemory(agentId) {
    const events = (0, memoryStore_1.getRecentMemoryEvents)(agentId, 25);
    if (events.length === 0)
        return [];
    const top = [...events]
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 5)
        .map((event) => `${event.type}: ${event.summary}`);
    return top;
}
