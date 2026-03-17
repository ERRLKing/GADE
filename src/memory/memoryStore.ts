import { db } from '../db/sqlite'

export type MemoryEventRow = {
  id: number
  agent_id: string
  type: string
  summary: string
  importance: number
  created_at: string
}

const insertMemoryEventStmt = db.prepare(`
  INSERT INTO memory_events (agent_id, type, summary, importance)
  VALUES (?, ?, ?, ?)
`)

const getRecentMemoryEventsStmt = db.prepare(`
  SELECT id, agent_id, type, summary, importance, created_at
  FROM memory_events
  WHERE agent_id = ?
  ORDER BY id DESC
  LIMIT ?
`)

const upsertLongTermSummaryStmt = db.prepare(`
  INSERT INTO memory_summaries (agent_id, summary_json, updated_at)
  VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(agent_id)
  DO UPDATE SET summary_json = excluded.summary_json, updated_at = CURRENT_TIMESTAMP
`)

const getLongTermSummaryStmt = db.prepare(`
  SELECT summary_json FROM memory_summaries WHERE agent_id = ?
`)

export function insertMemoryEvent(agentId: string, type: string, summary: string, importance: number): void {
  insertMemoryEventStmt.run(agentId, type, summary, importance)
}

export function getRecentMemoryEvents(agentId: string, limit = 20): MemoryEventRow[] {
  return getRecentMemoryEventsStmt.all(agentId, limit) as MemoryEventRow[]
}

export function upsertLongTermSummary(agentId: string, summary: string[]): void {
  upsertLongTermSummaryStmt.run(agentId, JSON.stringify(summary))
}

export function getLongTermSummary(agentId: string): string[] {
  const row = getLongTermSummaryStmt.get(agentId) as { summary_json: string } | undefined
  if (!row) return []

  try {
    const parsed = JSON.parse(row.summary_json)
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []
  } catch {
    return []
  }
}
