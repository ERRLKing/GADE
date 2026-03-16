import { db } from '../db/sqlite'

export type MemoryEventRow = {
  id: number
  agent_id: string
  type: string
  summary: string
  importance: number
  created_at: string
}

export function insertMemoryEvent(agentId: string, type: string, summary: string, importance: number): void {
  const stmt = db.prepare(`
    INSERT INTO memory_events (agent_id, type, summary, importance)
    VALUES (?, ?, ?, ?)
  `)
  stmt.run(agentId, type, summary, importance)
}

export function getRecentMemoryEvents(agentId: string, limit = 20): MemoryEventRow[] {
  const stmt = db.prepare(`
    SELECT id, agent_id, type, summary, importance, created_at
    FROM memory_events
    WHERE agent_id = ?
    ORDER BY id DESC
    LIMIT ?
  `)
  return stmt.all(agentId, limit) as MemoryEventRow[]
}

export function upsertLongTermSummary(agentId: string, summary: string[]): void {
  const stmt = db.prepare(`
    INSERT INTO memory_summaries (agent_id, summary_json, updated_at)
    VALUES (?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(agent_id)
    DO UPDATE SET summary_json = excluded.summary_json, updated_at = CURRENT_TIMESTAMP
  `)
  stmt.run(agentId, JSON.stringify(summary))
}

export function getLongTermSummary(agentId: string): string[] {
  const stmt = db.prepare(`SELECT summary_json FROM memory_summaries WHERE agent_id = ?`)
  const row = stmt.get(agentId) as { summary_json: string } | undefined
  if (!row) return []
  try {
    const parsed = JSON.parse(row.summary_json)
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === 'string') : []
  } catch {
    return []
  }
}
