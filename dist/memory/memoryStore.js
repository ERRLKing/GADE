"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertMemoryEvent = insertMemoryEvent;
exports.getRecentMemoryEvents = getRecentMemoryEvents;
exports.upsertLongTermSummary = upsertLongTermSummary;
exports.getLongTermSummary = getLongTermSummary;
const sqlite_1 = require("../db/sqlite");
function insertMemoryEvent(agentId, type, summary, importance) {
    const stmt = sqlite_1.db.prepare(`
    INSERT INTO memory_events (agent_id, type, summary, importance)
    VALUES (?, ?, ?, ?)
  `);
    stmt.run(agentId, type, summary, importance);
}
function getRecentMemoryEvents(agentId, limit = 20) {
    const stmt = sqlite_1.db.prepare(`
    SELECT id, agent_id, type, summary, importance, created_at
    FROM memory_events
    WHERE agent_id = ?
    ORDER BY id DESC
    LIMIT ?
  `);
    return stmt.all(agentId, limit);
}
function upsertLongTermSummary(agentId, summary) {
    const stmt = sqlite_1.db.prepare(`
    INSERT INTO memory_summaries (agent_id, summary_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(agent_id)
    DO UPDATE SET summary_json = excluded.summary_json, updated_at = CURRENT_TIMESTAMP
  `);
    stmt.run(agentId, JSON.stringify(summary));
}
function getLongTermSummary(agentId) {
    const stmt = sqlite_1.db.prepare(`SELECT summary_json FROM memory_summaries WHERE agent_id = ?`);
    const row = stmt.get(agentId);
    if (!row)
        return [];
    try {
        const parsed = JSON.parse(row.summary_json);
        return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : [];
    }
    catch {
        return [];
    }
}
