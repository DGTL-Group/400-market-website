import { NextRequest, NextResponse } from 'next/server'

const BASE_URL = 'https://app.sendmails.io/api/v1'

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

    // 1. Check if subscriber already exists
    const findRes = await fetch(
      `${BASE_URL}/subscribers/email/${encodeURIComponent(email)}?api_token=${apiToken}&list_uid=${listUid}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
    )

    if (findRes.ok) {
      const findData = await findRes.json()
      const allMatches = findData.subscribers ?? (findData.subscriber ? [findData.subscriber] : [])
      const subscriber = allMatches.find((s: { list_uid: string }) => s.list_uid === listUid)

      if (subscriber) {
        // Already actively subscribed
        if (subscriber.status === 'subscribed') {
          return NextResponse.json({
            success: false,
            alreadySubscribed: true,
            message: 'You are already subscribed to our newsletter.',
          })
        }

        // Previously unsubscribed — resubscribe them
        if (subscriber.status === 'unsubscribed') {
          const resubRes = await fetch(
            `${BASE_URL}/lists/${listUid}/subscribers/${subscriber.id}/subscribe?api_token=${apiToken}`,
            { method: 'PATCH', headers: { Accept: 'application/json' } },
          )

          if (resubRes.ok) {
            return NextResponse.json({
              success: true,
              message: 'Thanks for joining the email newsletter!',
            })
          }

          return NextResponse.json({
            success: false,
            message: 'Could not resubscribe. Please try again.',
          })
        }
      }
    }

    // 2. New subscriber — create
    const createRes = await fetch(`${BASE_URL}/subscribers?api_token=${apiToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        list_uid: listUid,
        EMAIL: email,
        status: 'subscribed',
      }),
    })

    const createData = await createRes.json()

    if (createData.status === 1) {
      return NextResponse.json({
        success: true,
        message: 'Thanks for joining the email newsletter!',
      })
    }

    return NextResponse.json({
      success: false,
      message: createData.message || 'Could not subscribe. Please try again.',
    })
  } catch {
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
  }
}
