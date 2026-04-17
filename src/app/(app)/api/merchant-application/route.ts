import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { firstName, lastName, businessName, email, phone, booth, description } = body as {
    firstName?: string
    lastName?: string
    businessName?: string
    email?: string
    phone?: string
    booth?: string // optional — pre-filled from floor plan click
    description?: string
  }

  if (!firstName || !lastName || !businessName || !email || !phone || !description) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  // TODO: wire to an email service (Resend, SendGrid, etc.) once the
  // client's email adapter is set up. For now, log the submission.
  console.log('[merchant-application]', {
    firstName,
    lastName,
    businessName,
    email,
    phone,
    booth: booth || '(none)',
    description: description.slice(0, 200),
  })

  return NextResponse.json({ ok: true })
}
