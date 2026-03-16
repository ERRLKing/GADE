import { getRecentMemoryEvents } from './memoryStore'

export function summarizeMemory(agentId: string): string[] {
  const events = getRecentMemoryEvents(agentId, 25)
  if (events.length === 0) return []

  const top = [...events]
    .sort((a, b) => b.importance - a.importance)
    .slice(0, 5)
    .map((event) => `${event.type}: ${event.summary}`)

  return top
}
