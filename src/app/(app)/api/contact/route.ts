import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, subject, message } = body as {
    name?: string
    email?: string
    subject?: string
    message?: string
  }

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  // TODO: wire to an email service (Resend, SendGrid, etc.) once the
  // client's email adapter is set up. For now, log the submission so
  // we can verify the form flow works end-to-end during development.
  console.log('[contact-form]', { name, email, subject, message: message.slice(0, 200) })

  return NextResponse.json({ ok: true })
}
