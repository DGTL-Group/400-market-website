import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

/**
 * GET /api/events/[slug]/ics
 *
 * Returns a downloadable iCalendar (.ics) file for a single event.
 * Works with Google Calendar, Apple Calendar, Outlook, and any RFC 5545 client.
 */

type Params = { params: Promise<{ slug: string }> }

// Extract plain text from a Lexical SerializedEditorState — joins all paragraph blocks.
function extractPlainText(rich: unknown): string {
  if (!rich || typeof rich !== 'object') return ''
  const root = (rich as { root?: { children?: unknown[] } }).root
  if (!root?.children) return ''
  const paragraphs: string[] = []
  for (const block of root.children) {
    if (
      typeof block === 'object' &&
      block !== null &&
      'children' in block &&
      Array.isArray((block as { children: unknown[] }).children)
    ) {
      const inline = (block as { children: { text?: string }[] }).children
        .map((c) => c?.text || '')
        .join('')
      if (inline.trim()) paragraphs.push(inline)
    }
  }
  return paragraphs.join('\n\n')
}

// Format a Date as a UTC stamp like 20260411T130000Z
function toIcsUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

// Escape iCal text per RFC 5545: backslash, semicolon, comma, newline.
function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

// Fold long lines per RFC 5545 (max 75 octets, continuation starts with a space).
function foldIcsLine(line: string): string {
  if (line.length <= 75) return line
  const chunks: string[] = []
  let i = 0
  // First chunk: 75 chars. Subsequent chunks: 74 chars (room for leading space).
  chunks.push(line.slice(i, i + 75))
  i += 75
  while (i < line.length) {
    chunks.push(' ' + line.slice(i, i + 74))
    i += 74
  }
  return chunks.join('\r\n')
}

function buildIcs(event: {
  name: string
  slug: string
  startDate: string
  endDate?: string | null
  description?: string
  location?: string | null
  origin: string
}): string {
  const dtStart = toIcsUtc(new Date(event.startDate))
  const dtEnd = event.endDate
    ? toIcsUtc(new Date(event.endDate))
    : toIcsUtc(new Date(new Date(event.startDate).getTime() + 60 * 60 * 1000)) // +1h fallback
  const dtStamp = toIcsUtc(new Date())

  const summary = escapeIcsText(event.name)
  const location = escapeIcsText(
    event.location
      ? `${event.location}, 2207 Industrial Park Rd, Innisfil ON L9S 3V9`
      : '2207 Industrial Park Rd, Innisfil ON L9S 3V9',
  )
  const description = escapeIcsText(event.description || '')
  const url = `${event.origin}/events/${event.slug}`
  const uid = `${event.slug}-${dtStart}@400market.ca`

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//The 400 Market//Events//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    `URL:${url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.map(foldIcsLine).join('\r\n') + '\r\n'
}

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params

  try {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'events',
      where: { slug: { equals: slug } },
      limit: 1,
    })

    const event = docs[0]
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const origin = new URL(request.url).origin
    const ics = buildIcs({
      name: event.name,
      slug: event.slug,
      startDate: event.startDate,
      endDate: event.endDate,
      description: extractPlainText(event.description),
      location: event.location,
      origin,
    })

    return new NextResponse(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}.ics"`,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (err) {
    console.error('Failed to generate ICS for', slug, err)
    return NextResponse.json({ error: 'Failed to generate calendar file' }, { status: 500 })
  }
}
