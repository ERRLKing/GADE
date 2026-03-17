import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

export type DbMode = 'file' | 'memory'

export type DbInfo = {
  configuredPath: string
  resolvedPath: string
  mode: DbMode
}

function resolveDbInfo(): DbInfo {
  const configuredPath = (process.env.DB_PATH || './data/agent-memory.sqlite').trim()

  if (!configuredPath || configuredPath === ':memory:') {
    return {
      configuredPath: configuredPath || ':memory:',
      resolvedPath: ':memory:',
      mode: 'memory',
    }
  }

  const resolvedPath = path.resolve(configuredPath)
  fs.mkdirSync(path.dirname(resolvedPath), { recursive: true })

  return {
    configuredPath,
    resolvedPath,
    mode: 'file',
  }
}

export const dbInfo = resolveDbInfo()

export const db = new Database(dbInfo.resolvedPath)

db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.pragma('busy_timeout = 5000')

db.exec(`
CREATE TABLE IF NOT EXISTS memory_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_id TEXT NOT NULL,
  type TEXT NOT NULL,
  summary TEXT NOT NULL,
  importance REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_memory_events_agent_id_id
ON memory_events(agent_id, id DESC);

CREATE TABLE IF NOT EXISTS memory_summaries (
  agent_id TEXT PRIMARY KEY,
  summary_json TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`)
