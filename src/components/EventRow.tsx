import Link from 'next/link'

type EventRowProps = {
  name: string
  slug: string
  startDate: string
  endDate?: string | null
  description?: string
  location?: string | null
  featuredImage?: {
    url?: string | null
    alt?: string | null
  } | null
  featured?: boolean
  highlight?: boolean
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function formatTorontoDate(iso: string) {
  // Use Intl to extract month + day in America/Toronto reliably
  const dt = new Date(iso)
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Toronto',
    month: 'short',
    day: '2-digit',
    weekday: 'long',
  })
  const parts = fmt.formatToParts(dt)
  const month = parts.find((p) => p.type === 'month')?.value.toUpperCase().replace('.', '') || ''
  const day = parts.find((p) => p.type === 'day')?.value || ''
  const weekday = parts.find((p) => p.type === 'weekday')?.value || ''
  return { month, day, weekday }
}

function formatTimeRange(startIso: string, endIso?: string | null) {
  const tz = 'America/Toronto'
  const startDate = new Date(startIso)
  const start = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(startDate).toUpperCase().replace(' ', '')

  if (!endIso) return start

  const endDate = new Date(endIso)
  const end = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(endDate).toUpperCase().replace(' ', '')

  return `${start} – ${end}`
}

function formatDayRange(startIso: string, endIso?: string | null) {
  const tz = 'America/Toronto'
  const startDate = new Date(startIso)
  const startWeekday = new Intl.DateTimeFormat('en-CA', { timeZone: tz, weekday: 'long' }).format(startDate)

  if (!endIso) return startWeekday

  const endDate = new Date(endIso)
  const endWeekday = new Intl.DateTimeFormat('en-CA', { timeZone: tz, weekday: 'long' }).format(endDate)
  if (startWeekday === endWeekday) return startWeekday
  return `${startWeekday} – ${endWeekday}`
}

export default function EventRow({
  name,
  slug,
  startDate,
  endDate,
  description,
  location,
  featuredImage,
  featured = false,
  highlight = false,
}: EventRowProps) {
  const { month, day } = formatTorontoDate(startDate)
  const dayRange = formatDayRange(startDate, endDate)
  const timeRange = formatTimeRange(startDate, endDate)
  const venue = location || '2207 Industrial Park Rd, Innisfil ON'

  return (
    <div
      className={`flex flex-col md:flex-row gap-6 px-6 md:px-20 py-8 border-b border-surface-light items-start ${
        highlight ? 'bg-surface-light/60' : ''
      }`}
    >
      {/* Date box */}
      <div className="bg-brand-yellow w-20 h-20 md:w-[88px] md:h-[88px] flex flex-col items-center justify-center flex-shrink-0">
        <span className="font-body text-[14px] font-bold tracking-wide text-brand-dark">{month}</span>
        <span className="font-body text-[30px] md:text-[34px] font-bold leading-none text-brand-dark">{day}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {featured && (
          <span className="inline-block bg-brand-mango text-white text-caption font-bold uppercase tracking-wider px-2.5 py-1 mb-2 rounded-button">
            Featured
          </span>
        )}
        <h3 className="font-body font-bold text-display-sm text-text-primary mb-1">{name}</h3>
        <p className="text-body-sm text-text-secondary mb-1">
          {dayRange} &nbsp;·&nbsp; {timeRange} &nbsp;·&nbsp; {venue}
        </p>
        {description && (
          <p className="text-body-sm text-text-secondary mb-4 line-clamp-2 max-w-2xl">{description}</p>
        )}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={`/events/${slug}`}
            className="group inline-flex items-center gap-1.5 bg-brand-yellow text-brand-dark font-bold text-[13px] uppercase tracking-wide px-5 py-2.5 rounded-button hover:bg-brand-orange transition-colors duration-500"
          >
            Event Details
            <svg className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h16M13 5l7 7-7 7" />
            </svg>
          </Link>
          <a
            href={`/api/events/${slug}/ics`}
            download={`${slug}.ics`}
            className="group relative text-brand-mango text-body-sm font-semibold hover:text-brand-orange transition-colors duration-500"
          >
            + Add to Calendar
            <span className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 inline-flex items-center gap-1 whitespace-nowrap pointer-events-none">
              <svg
                className="w-4 h-4 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-200 group-hover:delay-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <svg
                className="w-[22px] h-[22px] opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 group-hover:delay-200"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Calendar body */}
                <rect x="3" y="5" width="18" height="16" rx="2" fill="white" stroke="currentColor" strokeWidth="2" />
                {/* Header strip with only top corners rounded — uses currentColor to match arrow */}
                <path d="M3 9 V 7 A 2 2 0 0 1 5 5 H 19 A 2 2 0 0 1 21 7 V 9 Z" fill="currentColor" />
                {/* Binder hooks at top */}
                <line x1="8" y1="3" x2="8" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="3" x2="16" y2="7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
          </a>
        </div>
      </div>

      {/* Thumbnail */}
      <div className="w-full md:w-[280px] aspect-[16/9] md:aspect-auto md:h-[160px] flex-shrink-0 bg-surface-light overflow-hidden">
        {featuredImage?.url ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={featuredImage.url}
            alt={featuredImage.alt || name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-subtle text-body-sm">
            No image
          </div>
        )}
      </div>
    </div>
  )
}
