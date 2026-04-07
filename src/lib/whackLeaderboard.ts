/**
 * Shared helpers for the 404 whack-a-vendor weekly leaderboard.
 *
 * These live in a separate module so both the game component
 * (`WhackAVendor`) and the 404 page (`not-found.tsx`) can build the same
 * query and parse the same response shape. The 404 page uses this to
 * preload the leaderboard on mount — by the time the player clicks START
 * GAME, the data is already in state, so the grid never jumps when the
 * leaderboard's rows arrive.
 */

export const LEADERBOARD_LIMIT = 10

export type LeaderboardEntry = {
  id: string | number
  name: string
  score: number
  createdAt: string
}

/**
 * Returns the start of the current ISO week (Monday 00:00 UTC) as an
 * ISO string. The leaderboard query filters on `createdAt >= weekStart`,
 * so old entries fall off the public board automatically every Monday.
 */
export function getWeekStartISO(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const daysFromMonday = (day + 6) % 7
  const weekStart = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysFromMonday,
      0,
      0,
      0,
      0,
    ),
  )
  return weekStart.toISOString()
}

/** Builds the Payload REST URL for this week's top scores. */
export function buildLeaderboardURL(): string {
  const weekStart = getWeekStartISO()
  return (
    `/api/whack-scores` +
    `?where[createdAt][greater_than_equal]=${encodeURIComponent(weekStart)}` +
    `&sort=-score&limit=${LEADERBOARD_LIMIT}&depth=0`
  )
}

/**
 * Fetches the current week's top scores. Throws on non-2xx so callers can
 * branch on their own error state. Always returns a defined array on success
 * (empty if the API returned a malformed payload).
 */
export async function fetchLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  const res = await fetch(buildLeaderboardURL(), { cache: 'no-store' })
  if (!res.ok) throw new Error(`whack-scores fetch failed: ${res.status}`)
  const json = await res.json()
  return Array.isArray(json?.docs) ? json.docs : []
}
