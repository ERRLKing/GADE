export function parseModelJson<T>(raw: string): T {
  return JSON.parse(raw) as T
}
