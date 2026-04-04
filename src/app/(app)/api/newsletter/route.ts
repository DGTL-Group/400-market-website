import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required.' }, { status: 400 })
    }

    const apiToken = process.env.SENDMAILS_API_TOKEN
    const listUid = process.env.SENDMAILS_LIST_UID

    if (!apiToken || !listUid) {
      console.error('Missing SENDMAILS_API_TOKEN or SENDMAILS_LIST_UID env vars')
      return NextResponse.json({ error: 'Newsletter service not configured.' }, { status: 500 })
    }

    const res = await fetch(
      `https://app.sendmails.io/api/v1/subscribers?api_token=${apiToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          list_uid: listUid,
          EMAIL: email,
        }),
      }
    )

    const data = await res.json()

    if (data.status === 1) {
      return NextResponse.json({ success: true, message: 'Subscribed successfully!' })
    }

    // SendMails returns status 0 for errors (e.g. already subscribed)
    return NextResponse.json({
      success: false,
      message: data.message || 'Could not subscribe. Please try again.',
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
