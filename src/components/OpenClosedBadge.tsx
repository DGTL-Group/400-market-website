'use client'

import { useEffect, useState } from 'react'

/**
 * Market hours (America/Toronto): Saturday & Sunday, 9:00 AM - 5:00 PM.
 * Everything else is closed.
 */
const OPEN_DAYS = [6, 0] // Sat = 6, Sun = 0 (JS getDay)
const OPEN_HOUR = 9
const CLOSE_HOUR = 17

// Emergency override. When true, every badge on the site flips to the
// amber "Closed — Emergency" state regardless of the clock. This is
// currently a hard-coded constant; pre-launch this gets wired up to a
// Payload `SiteStatus` global so staff can toggle it from the admin
// (and optionally attach a reason string like "Extreme weather").
// See pre-launch-todo.md for the full automation plan.
const EMERGENCY_CLOSURE = false
const EMERGENCY_REASON: string | null = null

type Status = 'open' | 'closed' | 'emergency'

function getStatus(now: Date): Status {
  if (EMERGENCY_CLOSURE) return 'emergency'
  return isOpenNow(now) ? 'open' : 'closed'
}

function isOpenNow(now: Date): boolean {
  // Pull Toronto day/hour/minute so visitors in any timezone see the correct
  // state — the market itself runs on Ontario time.
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now)

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? ''
  const hour = Number(parts.find((p) => p.type === 'hour')?.value ?? 0)
  const minute = Number(parts.find((p) => p.type === 'minute')?.value ?? 0)

  const dayIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[weekday]
  if (dayIndex === undefined) return false
  if (!OPEN_DAYS.includes(dayIndex)) return false

  const minutes = hour * 60 + minute
  return minutes >= OPEN_HOUR * 60 && minutes < CLOSE_HOUR * 60
}

type Variant = 'pill' | 'inline'

// Per-status styling tokens — single source of truth so pill + inline
// variants can't drift apart.
const STATUS_STYLES: Record<Status, {
  label: string
  dot: string
  pillBg: string
  pillText: string
  inlineText: string
}> = {
  open: {
    label: 'Open Now',
    dot: 'bg-green-500',
    pillBg: 'bg-green-100',
    pillText: 'text-green-800',
    inlineText: 'text-green-400',
  },
  closed: {
    label: 'Closed',
    dot: 'bg-red-500',
    pillBg: 'bg-red-100',
    pillText: 'text-red-800',
    inlineText: 'text-red-400',
  },
  emergency: {
    label: 'Emergency Closure',
    dot: 'bg-amber-500',
    pillBg: 'bg-amber-100',
    pillText: 'text-amber-900',
    inlineText: 'text-amber-400',
  },
}

export default function OpenClosedBadge({ variant = 'pill' }: { variant?: Variant } = {}) {
  // Avoid hydration mismatch — render nothing until after mount, then the
  // badge appears. The rest of the card is static and always visible.
  const [mounted, setMounted] = useState(false)
  const [status, setStatus] = useState<Status>('closed')

  useEffect(() => {
    setMounted(true)
    setStatus(getStatus(new Date()))
    // Re-check every minute so the badge flips live as the clock rolls
    // past 9am / 5pm (or once the emergency flag changes on rebuild).
    const id = setInterval(() => setStatus(getStatus(new Date())), 60_000)
    return () => clearInterval(id)
  }, [])

  if (!mounted) return null

  const s = STATUS_STYLES[status]
  const showReason = status === 'emergency' && EMERGENCY_REASON
  const reasonLabel = showReason ? `(${EMERGENCY_REASON})` : null

  // "inline" drops the colored pill background so the badge sits flush on
  // dark surfaces like the footer — just the dot + label, brighter text.
  if (variant === 'inline') {
    return (
      <span className="inline-flex items-center gap-1.5 font-body text-body-sm font-bold uppercase tracking-wide">
        <span
          className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`}
          aria-hidden="true"
        />
        <span className={`flex flex-col ${s.inlineText}`}>
          <span className="whitespace-nowrap">{s.label}</span>
          {reasonLabel && <span className="whitespace-nowrap">{reasonLabel}</span>}
        </span>
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-body text-body-sm leading-tight font-bold uppercase tracking-wide px-2.5 py-1.5 rounded-button ${s.pillBg} ${s.pillText} max-w-full`}
    >
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`}
        aria-hidden="true"
      />
      <span className="flex flex-col min-w-0">
        <span className="whitespace-nowrap">{s.label}</span>
        {reasonLabel && <span className="whitespace-nowrap">{reasonLabel}</span>}
      </span>
    </span>
  )
}
