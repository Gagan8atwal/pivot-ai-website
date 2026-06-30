/**
 * lib/parse.ts — pure response-shape helpers (dependency-free, unit-testable).
 *
 * The backend wraps list endpoints under a named key, e.g.
 *   GET /app/leads        → { "leads": [...] }
 *   GET /app/appointments → { "appointments": [...] }
 * Reading such a response as a bare array (`res.map(...)`) throws
 * "res.map is not a function". pickArray() unwraps the documented key(s) and
 * always returns a real array (empty when absent), so the UI shows an empty
 * state instead of an error.
 */

/**
 * Return the first array found at one of `keys` on an object, or the value
 * itself if it is already an array, or [] otherwise.
 *
 *   pickArray({ leads: [a, b] }, 'leads')        // [a, b]
 *   pickArray({ appointments: [] }, 'appointments') // []
 *   pickArray([a, b], 'leads')                   // [a, b]  (already an array)
 *   pickArray(null, 'leads')                     // []
 */
export function pickArray<T>(value: unknown, ...keys: string[]): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    for (const key of keys) {
      if (Array.isArray(obj[key])) return obj[key] as T[]
    }
  }
  return []
}
