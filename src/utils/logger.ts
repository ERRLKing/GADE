export function logInfo(message: string, meta?: unknown): void {
  console.log('[engine]', message, meta ?? '')
}

export function logError(message: string, meta?: unknown): void {
  console.error('[engine][error]', message, meta ?? '')
}
