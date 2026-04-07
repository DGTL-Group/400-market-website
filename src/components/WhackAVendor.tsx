'use client'

import { memo, useEffect, useRef, useState } from 'react'
import {
  LEADERBOARD_LIMIT,
  fetchLeaderboardEntries,
  type LeaderboardEntry,
} from '@/lib/whackLeaderboard'

const GRID_SIZE = 9
const GAME_DURATION = 30 // seconds
// Spawn delay range — random per pop so timing feels organic.
const POP_DELAY_MIN = 180 // ms
const POP_DELAY_MAX = 330 // ms
// Pop duration range — how long a vendor stays popped up before sliding out.
// Long enough that you actually have time to read and aim before it leaves.
const POP_DURATION_MIN = 750 // ms
const POP_DURATION_MAX = 1100 // ms
// After a booth is vacated (whacked or expired) it cannot be re-used for this
// many ms. Stops a vendor from instantly respawning in the same booth, which
// reads as "the same vendor never left".
const BOOTH_COOLDOWN_MS = 350
const VENDORS = ['🧑‍🍳', '👨‍🌾', '👩‍🎨', '🧑‍🔧', '👨‍🍳', '👩‍🌾', '🧑‍🌾', '👩‍🍳']

const NAME_MAX_LENGTH = 20
// localStorage key for the IDs of scores already submitted from this browser,
// so a player can't double-post the same game-over screen.
const SUBMITTED_KEY = 'whack-a-vendor-submitted'

function randBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

type GameState = 'idle' | 'countdown' | 'playing' | 'gameover'

type WhackAVendorProps = {
  /**
   * When true, the game skips its own idle overlay and goes straight to
   * the 3-2-1 countdown as soon as it mounts. Used by the 404 page so the
   * intro screen's "Start Game" button doesn't make the player click twice.
   */
  autoStart?: boolean
  /**
   * Pre-fetched leaderboard entries from the parent (the 404 page fetches
   * them on mount so they're hot by the time the player clicks START GAME).
   * When provided, the component skips its own mount-time fetch — this
   * prevents the leaderboard loading state from pushing the game grid
   * around on mobile. `null` means "parent hasn't loaded them yet", so the
   * component falls back to its own fetch.
   */
  initialLeaderboard?: LeaderboardEntry[] | null
  /** Mirror of the parent's preload error state — same null semantics. */
  initialLeaderboardError?: boolean
}

export default function WhackAVendor({
  autoStart = false,
  initialLeaderboard = null,
  initialLeaderboardError = false,
}: WhackAVendorProps = {}) {
  // If the parent already has data or an error, we can skip the mount fetch.
  const parentProvidedBoard = initialLeaderboard !== null || initialLeaderboardError
  const [gameState, setGameState] = useState<GameState>('idle')
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION)
  const [bestScore, setBestScore] = useState(0)
  const [activeBooths, setActiveBooths] = useState<Map<number, string>>(new Map())
  const [whackedBooths, setWhackedBooths] = useState<Set<number>>(new Set())
  const [countdown, setCountdown] = useState(3)

  // Leaderboard state — seeded from the parent's preload when available,
  // otherwise we fetch on mount. Loading is only true if we actually need
  // to fetch (parent didn't hand us data and didn't error out).
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(
    initialLeaderboard ?? [],
  )
  const [leaderboardLoading, setLeaderboardLoading] = useState(!parentProvidedBoard)
  const [leaderboardError, setLeaderboardError] = useState(initialLeaderboardError)
  const [playerName, setPlayerName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedEntryId, setSubmittedEntryId] = useState<string | number | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Refs to avoid stale closures inside intervals
  const scoreRef = useRef(0)
  const bestScoreRef = useRef(0)
  const endTimeRef = useRef(0)
  const popTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const popHideTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  const whackTimers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())
  // Live mirror of activeBooths so the spawn loop can read the latest state
  // synchronously without relying on stale closures or setState callbacks.
  const activeBoothsRef = useRef<Map<number, string>>(new Map())
  // Tracks when each booth becomes available again (timestamp ms). A booth
  // is "cooling down" until Date.now() passes its entry.
  const boothCooldownRef = useRef<Map<number, number>>(new Map())

  // Load best score from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('whack-a-vendor-best')
      const v = stored ? parseInt(stored, 10) || 0 : 0
      setBestScore(v)
      bestScoreRef.current = v
    } catch {
      /* localStorage unavailable — silent fallback */
    }
  }, [])

  // Clean up all timers on unmount. Capture the ref Maps locally so the
  // cleanup function references the same object the effect saw at mount —
  // satisfies react-hooks/exhaustive-deps without changing behaviour, since
  // refs persist across renders and we mutate (not reassign) these Maps.
  useEffect(() => {
    const popHide = popHideTimers.current
    const whack = whackTimers.current
    return () => {
      if (popTimerRef.current) clearTimeout(popTimerRef.current)
      if (tickIntervalRef.current) clearInterval(tickIntervalRef.current)
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current)
      popHide.forEach((t) => clearTimeout(t))
      whack.forEach((t) => clearTimeout(t))
      popHide.clear()
      whack.clear()
    }
  }, [])

  // Fetch the current week's leaderboard on mount — but only if the parent
  // hasn't already preloaded it for us. The 404 page kicks off its fetch the
  // moment the user lands, so by the time the player clicks START GAME the
  // data is usually already in props and this fetch is skipped.
  useEffect(() => {
    if (!parentProvidedBoard) {
      fetchLeaderboard()
    }
    // Restore last player name from localStorage so repeat players don't
    // have to retype it on every game over.
    try {
      const stored = localStorage.getItem('whack-a-vendor-name')
      if (stored) setPlayerName(stored.slice(0, NAME_MAX_LENGTH))
    } catch {
      /* localStorage unavailable — silent fallback */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Auto-start when the parent asks for it (404 intro flow).
  //
  // No ref guard here on purpose: in React 18 strict mode dev, effects run
  // setup → cleanup → setup on first mount. The cleanup of the timer-cleanup
  // effect above wipes the countdown timer we scheduled in the first setup,
  // so the second setup MUST be free to re-call beginCountdown — otherwise
  // the countdown freezes at "3" forever in dev. In production strict mode
  // is off so the effect runs exactly once. beginCountdown() starts with
  // clearAllTimers(), so calling it twice in a row is idempotent.
  useEffect(() => {
    if (autoStart) {
      beginCountdown()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart])

  async function fetchLeaderboard() {
    setLeaderboardLoading(true)
    setLeaderboardError(false)
    try {
      const docs = await fetchLeaderboardEntries()
      setLeaderboard(docs)
    } catch {
      setLeaderboardError(true)
    } finally {
      setLeaderboardLoading(false)
    }
  }

  async function submitScore() {
    const trimmed = playerName.trim().slice(0, NAME_MAX_LENGTH)
    if (!trimmed) {
      setSubmitError('Enter a name first')
      return
    }
    if (submitting || submittedEntryId !== null) return

    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/whack-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed, score: scoreRef.current }),
      })
      if (!res.ok) throw new Error(`status ${res.status}`)
      const json = await res.json()
      // Payload returns the created doc under `doc`.
      const created: LeaderboardEntry | undefined = json?.doc
      if (created?.id !== undefined) {
        setSubmittedEntryId(created.id)
        // Persist this submission so a refresh / page reload doesn't let
        // the same player re-submit the same score.
        try {
          const raw = localStorage.getItem(SUBMITTED_KEY)
          const list: (string | number)[] = raw ? JSON.parse(raw) : []
          list.push(created.id)
          // Keep the list bounded — we never need more than the last few.
          localStorage.setItem(SUBMITTED_KEY, JSON.stringify(list.slice(-20)))
          localStorage.setItem('whack-a-vendor-name', trimmed)
        } catch {
          /* silent */
        }
      }
      // Refresh the board so the new entry shows up in the right rank.
      await fetchLeaderboard()
    } catch {
      setSubmitError('Could not submit — try again')
    } finally {
      setSubmitting(false)
    }
  }

  function clearAllTimers() {
    if (popTimerRef.current) {
      clearTimeout(popTimerRef.current)
      popTimerRef.current = null
    }
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
      tickIntervalRef.current = null
    }
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    popHideTimers.current.forEach((t) => clearTimeout(t))
    whackTimers.current.forEach((t) => clearTimeout(t))
    popHideTimers.current.clear()
    whackTimers.current.clear()
  }

  function beginCountdown() {
    clearAllTimers()
    scoreRef.current = 0
    setScore(0)
    setTimeLeft(GAME_DURATION)
    activeBoothsRef.current = new Map()
    boothCooldownRef.current = new Map()
    setActiveBooths(new Map())
    setWhackedBooths(new Set())
    setCountdown(3)
    // Reset submission state for the new run
    setSubmittedEntryId(null)
    setSubmitError(null)
    setGameState('countdown')

    // Tick down 3 → 2 → 1, then start the game
    let n = 3
    const tick = () => {
      n -= 1
      if (n > 0) {
        setCountdown(n)
        countdownTimerRef.current = setTimeout(tick, 800)
      } else {
        startGame()
      }
    }
    countdownTimerRef.current = setTimeout(tick, 800)
  }

  function startGame() {
    clearAllTimers()
    scoreRef.current = 0
    setScore(0)
    setTimeLeft(GAME_DURATION)
    activeBoothsRef.current = new Map()
    boothCooldownRef.current = new Map()
    setActiveBooths(new Map())
    setWhackedBooths(new Set())
    setGameState('playing')
    endTimeRef.current = Date.now() + GAME_DURATION * 1000

    // Self-scheduling spawn loop — random delay between pops feels organic.
    // We re-check the wall clock each tick and bail once the game window closes,
    // so a stray timeout can never spawn after the game has ended.
    const spawnLoop = () => {
      if (Date.now() >= endTimeRef.current) return

      // Build the candidate list: booths that are neither occupied nor cooling
      // down. This guarantees no double-spawn and no instant respawn after a
      // booth is vacated.
      const now = Date.now()
      const available: number[] = []
      for (let i = 0; i < GRID_SIZE; i++) {
        if (activeBoothsRef.current.has(i)) continue
        const cooldownEnd = boothCooldownRef.current.get(i)
        if (cooldownEnd && cooldownEnd > now) continue
        available.push(i)
      }

      // If every booth is busy or cooling, retry shortly without consuming a
      // full spawn slot — the player effectively gets a brief breather.
      if (available.length === 0) {
        popTimerRef.current = setTimeout(spawnLoop, 80)
        return
      }

      const idx = available[Math.floor(Math.random() * available.length)]
      const vendor = VENDORS[Math.floor(Math.random() * VENDORS.length)]

      const next = new Map(activeBoothsRef.current)
      next.set(idx, vendor)
      activeBoothsRef.current = next
      setActiveBooths(next)

      // Each vendor stays for a random duration — short ones reward fast clicks
      const popDuration = randBetween(POP_DURATION_MIN, POP_DURATION_MAX)
      const hideTimer = setTimeout(() => {
        if (activeBoothsRef.current.has(idx)) {
          const after = new Map(activeBoothsRef.current)
          after.delete(idx)
          activeBoothsRef.current = after
          setActiveBooths(after)
          // Mark this booth on cooldown so it can't be re-used immediately
          boothCooldownRef.current.set(idx, Date.now() + BOOTH_COOLDOWN_MS)
        }
        popHideTimers.current.delete(idx)
      }, popDuration)
      popHideTimers.current.set(idx, hideTimer)

      // Schedule the next spawn after a random delay
      popTimerRef.current = setTimeout(spawnLoop, randBetween(POP_DELAY_MIN, POP_DELAY_MAX))
    }
    popTimerRef.current = setTimeout(spawnLoop, randBetween(POP_DELAY_MIN, POP_DELAY_MAX))

    // Countdown tick — uses wall-clock to self-correct if a tick is delayed
    tickIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining === 0) endGame()
    }, 250)
  }

  function endGame() {
    clearAllTimers()
    activeBoothsRef.current = new Map()
    setActiveBooths(new Map())
    setGameState('gameover')

    if (scoreRef.current > bestScoreRef.current) {
      bestScoreRef.current = scoreRef.current
      setBestScore(scoreRef.current)
      try {
        localStorage.setItem('whack-a-vendor-best', String(scoreRef.current))
      } catch {
        /* localStorage unavailable — silent fallback */
      }
    }
  }

  function whack(idx: number) {
    if (gameState !== 'playing') return
    if (!activeBoothsRef.current.has(idx)) return

    scoreRef.current += 1
    setScore(scoreRef.current)

    const next = new Map(activeBoothsRef.current)
    next.delete(idx)
    activeBoothsRef.current = next
    setActiveBooths(next)

    // Apply cooldown so the same booth can't immediately respawn
    boothCooldownRef.current.set(idx, Date.now() + BOOTH_COOLDOWN_MS)

    // Cancel its hide timer
    const hide = popHideTimers.current.get(idx)
    if (hide) {
      clearTimeout(hide)
      popHideTimers.current.delete(idx)
    }

    // Cancel any in-progress whack feedback timer
    const existingWhack = whackTimers.current.get(idx)
    if (existingWhack) clearTimeout(existingWhack)

    setWhackedBooths((prev) => {
      const next = new Set(prev)
      next.add(idx)
      return next
    })

    const whackTimer = setTimeout(() => {
      setWhackedBooths((prev) => {
        const next = new Set(prev)
        next.delete(idx)
        return next
      })
      whackTimers.current.delete(idx)
    }, 300)
    whackTimers.current.set(idx, whackTimer)
  }

  function getGameOverMessage() {
    const s = scoreRef.current
    if (s === 0) return 'EVERY VENDOR ESCAPED'
    if (s < 5) return 'JUST WARMING UP'
    if (s < 15) return 'NICE REFLEXES'
    if (s < 25) return 'MARKET MASTER'
    return 'WHACK LEGEND'
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {/* HUD */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-2">
        <div className="text-left">
          <div className="font-body font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-text-subtle mb-0.5">
            Score
          </div>
          <div className="font-body font-bold text-xl sm:text-2xl text-brand-yellow tabular-nums leading-none">
            {score}
          </div>
        </div>
        <div className="text-center">
          <div className="font-body font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-text-subtle mb-0.5">
            Time
          </div>
          <div className="font-body font-bold text-xl sm:text-2xl text-white tabular-nums leading-none">
            {timeLeft}s
          </div>
        </div>
        <div className="text-right">
          <div className="font-body font-bold text-[10px] sm:text-[11px] uppercase tracking-widest text-text-subtle mb-0.5">
            Best
          </div>
          <div className="font-body font-bold text-xl sm:text-2xl text-brand-orange tabular-nums leading-none">
            {bestScore}
          </div>
        </div>
      </div>

      {/* Booth grid */}
      <div className="relative grid grid-cols-3 gap-2 sm:gap-3 p-3 sm:p-4 rounded-button bg-[#1a1a1a] border-2 border-[#3a3a3a]">
        {Array.from({ length: GRID_SIZE }).map((_, idx) => (
          <Booth
            key={idx}
            idx={idx}
            vendor={activeBooths.get(idx)}
            whacked={whackedBooths.has(idx)}
            disabled={gameState !== 'playing'}
            onWhack={() => whack(idx)}
          />
        ))}

        {/* Idle / countdown / game-over overlay — kept mounted so it can fade out */}
        <div
          className={`absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/95 backdrop-blur-sm rounded-button px-4 transition-opacity duration-300 ${
            gameState === 'playing' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {gameState === 'idle' && (
            <>
              <div className="font-display text-display-sm sm:text-display-md uppercase tracking-wide text-white mb-2 sm:mb-3 text-center">
                WHACK-A-VENDOR
              </div>
              <p className="font-body text-body-sm text-text-subtle text-center mb-4 sm:mb-5 max-w-[260px]">
                Whack as many vendors as you can in {GAME_DURATION} seconds.
              </p>
              <button type="button" onClick={beginCountdown} className="btn-primary">
                START GAME
              </button>
            </>
          )}

          {gameState === 'countdown' && (
            <div
              key={countdown}
              className="font-body font-black text-[5rem] sm:text-[6rem] md:text-[7rem] text-brand-yellow leading-none animate-countdown-pop"
            >
              {countdown}
            </div>
          )}

          {gameState === 'gameover' && (
            <>
              <div className="font-display text-display-sm sm:text-display-md uppercase tracking-wide text-brand-yellow mb-1 sm:mb-2 text-center px-2">
                {getGameOverMessage()}
              </div>
              <p className="font-body font-bold text-[13px] uppercase tracking-wider text-text-subtle text-center mb-3">
                Score: <span className="text-white">{scoreRef.current}</span>
                <span className="mx-2 opacity-50">·</span>
                Best: <span className="text-brand-orange">{bestScore}</span>
              </p>

              {submittedEntryId === null ? (
                <>
                  <p className="font-body text-body-sm text-text-subtle text-center mb-2 px-2">
                    Add your name to the weekly leaderboard:
                  </p>
                  <div className="flex flex-col items-stretch gap-2 w-full max-w-[260px]">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.slice(0, NAME_MAX_LENGTH))}
                      maxLength={NAME_MAX_LENGTH}
                      placeholder="Your name"
                      className="rounded-button bg-[#1a1a1a] border border-[#3a3a3a] px-4 py-3 font-body text-body-md text-white placeholder:text-text-subtle text-center focus:outline-none focus:border-brand-yellow"
                      disabled={submitting}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitScore()
                      }}
                    />
                    <button
                      type="button"
                      onClick={submitScore}
                      disabled={submitting || playerName.trim().length === 0}
                      className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'SUBMITTING…' : 'SUBMIT SCORE'}
                    </button>
                    {submitError && (
                      <p className="font-body text-[11px] text-brand-orange text-center">{submitError}</p>
                    )}
                    <button
                      type="button"
                      onClick={beginCountdown}
                      className="font-body font-bold text-[11px] uppercase tracking-wider text-text-subtle hover:text-brand-yellow transition-colors"
                    >
                      Skip & play again
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="font-body font-bold text-[11px] uppercase tracking-wider text-brand-yellow text-center mb-3">
                    {(() => {
                      const rank = leaderboard.findIndex((e) => e.id === submittedEntryId)
                      if (rank === -1) return 'SCORE SAVED — KEEP GRINDING!'
                      return `YOU\u2019RE #${rank + 1} THIS WEEK`
                    })()}
                  </p>
                  <button type="button" onClick={beginCountdown} className="btn-primary">
                    PLAY AGAIN
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Weekly leaderboard */}
      <div className="mt-4 sm:mt-5 rounded-button bg-[#1a1a1a] border-2 border-[#3a3a3a] p-3 sm:p-4">
        <div className="flex items-baseline justify-between mb-3 px-1">
          <div className="font-display text-display-sm uppercase tracking-wide text-brand-yellow">
            This Week
          </div>
          <div className="font-body font-bold text-[10px] uppercase tracking-widest text-text-subtle">
            Top {LEADERBOARD_LIMIT}
          </div>
        </div>

        {leaderboardLoading ? (
          <div className="font-body text-body-sm text-text-subtle text-center py-6">
            Loading leaderboard…
          </div>
        ) : leaderboardError ? (
          <div className="font-body text-body-sm text-text-subtle text-center py-6">
            Couldn&apos;t load leaderboard.{' '}
            <button
              type="button"
              onClick={fetchLeaderboard}
              className="text-brand-yellow hover:text-brand-orange underline"
            >
              Retry
            </button>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="font-body text-body-sm text-text-subtle text-center py-6">
            No scores yet this week. Be the first!
          </div>
        ) : (
          <ol className="space-y-1">
            {leaderboard.map((entry, idx) => {
              const isMe = entry.id === submittedEntryId
              const rank = idx + 1
              return (
                <li
                  key={entry.id}
                  className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-sm ${
                    isMe ? 'bg-brand-yellow/15 border border-brand-yellow/40' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`font-body font-bold text-[13px] tabular-nums w-6 text-right ${
                        rank === 1
                          ? 'text-brand-yellow'
                          : rank === 2
                            ? 'text-white'
                            : rank === 3
                              ? 'text-brand-orange'
                              : 'text-text-subtle'
                      }`}
                    >
                      {rank}
                    </span>
                    <span className="font-body text-body-sm text-white truncate">
                      {entry.name}
                      {isMe && (
                        <span className="ml-2 font-bold text-[10px] uppercase tracking-widest text-brand-yellow">
                          You
                        </span>
                      )}
                    </span>
                  </div>
                  <span className="font-body font-bold text-body-sm text-brand-yellow tabular-nums">
                    {entry.score}
                  </span>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}

/**
 * Booth — owns its own slide-in / slide-out lifecycle so a vanishing vendor
 * keeps rendering long enough to play the exit transition. The parent only
 * tells the booth which vendor (if any) is currently assigned to it.
 *
 * Phases:
 *  - 'idle'     : nothing displayed
 *  - 'entering' : vendor just assigned, mounted at translate-y-full so the
 *                 next render can transition it up
 *  - 'visible'  : vendor fully popped up
 *  - 'exiting'  : vendor was unassigned but we keep it on screen sliding down
 */
type BoothPhase = 'idle' | 'entering' | 'visible' | 'exiting'

const SLIDE_OUT_MS = 220

const Booth = memo(function Booth({
  idx,
  vendor,
  whacked,
  disabled,
  onWhack,
}: {
  idx: number
  vendor: string | undefined
  whacked: boolean
  disabled: boolean
  onWhack: () => void
}) {
  const [displayed, setDisplayed] = useState<string | null>(null)
  const [phase, setPhase] = useState<BoothPhase>('idle')

  useEffect(() => {
    let cancelled = false
    let raf: number | null = null
    let timeout: ReturnType<typeof setTimeout> | null = null

    if (vendor) {
      // New vendor — render at translate-y-full first, then transition up on
      // the next animation frame so the browser actually paints the start
      // position (otherwise the slide-in won't play).
      setDisplayed(vendor)
      setPhase('entering')
      raf = requestAnimationFrame(() => {
        if (!cancelled) setPhase('visible')
      })
    } else if (displayed) {
      // Vendor was just removed — hold the previous emoji while we slide it
      // out, then drop it from the DOM.
      setPhase('exiting')
      timeout = setTimeout(() => {
        if (cancelled) return
        setDisplayed(null)
        setPhase('idle')
      }, SLIDE_OUT_MS)
    }

    return () => {
      cancelled = true
      if (raf !== null) cancelAnimationFrame(raf)
      if (timeout !== null) clearTimeout(timeout)
    }
    // We intentionally only depend on `vendor` — `displayed` is read inside
    // the effect but should not retrigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendor])

  const slideUp = phase === 'visible'

  return (
    <button
      type="button"
      onClick={onWhack}
      disabled={disabled}
      className="relative aspect-square overflow-hidden rounded-button bg-brand-dark border border-[#3a3a3a] cursor-pointer disabled:cursor-default touch-manipulation focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2 focus:ring-offset-[#1a1a1a]"
      aria-label={vendor ? `Whack vendor at booth ${idx + 1}` : `Booth ${idx + 1}`}
    >
      {/* Awning stripes — no z-index so the idle/gameover overlay can cover them */}
      <div
        className="absolute top-0 left-0 right-0 h-3 sm:h-4"
        style={{
          background: 'repeating-linear-gradient(90deg, #F7D117 0 8px, #F7941D 8px 16px)',
        }}
      />
      {/* Booth interior */}
      <div className="absolute inset-x-1 top-3 sm:top-4 bottom-1 rounded-sm bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a]" />

      {/* Vendor pop-up */}
      <div
        className={`absolute inset-x-0 bottom-0 flex items-end justify-center pb-1 transition-transform ease-out ${
          slideUp ? 'translate-y-0 duration-150' : 'translate-y-full duration-200'
        }`}
      >
        <span className="text-3xl sm:text-4xl select-none leading-none">
          {displayed || ''}
        </span>
      </div>

      {/* Whack flash overlay */}
      {whacked && (
        <>
          <div className="absolute inset-0 bg-brand-yellow/50 z-20 pointer-events-none" />
          <span className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none font-body font-bold text-xl text-brand-dark">
            +1
          </span>
        </>
      )}
    </button>
  )
})
