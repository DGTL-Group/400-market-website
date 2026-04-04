'use client'

import { useState } from 'react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'already' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Subscribed!')
        setEmail('')
      } else if (res.ok && data.alreadySubscribed) {
        setStatus('already')
        setMessage(data.message || 'You are already subscribed.')
      } else {
        setStatus('error')
        setMessage(data.message || data.error || 'Something went wrong.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={status === 'loading'}
          className="bg-white border-none text-brand-dark px-4 py-4 text-[14px] w-[260px] outline-none placeholder:text-text-subtle focus:ring-2 focus:ring-brand-dark"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="bg-brand-dark text-white px-6 py-4 font-bold text-[13px] hover:bg-text-secondary transition-colors duration-500 disabled:opacity-50"
        >
          SUBSCRIBE
        </button>
      </form>
      {(status === 'success' || status === 'already' || status === 'error') && (
        <p className={`absolute left-0 top-full mt-2 text-[13px] font-semibold whitespace-nowrap ${status === 'error' ? 'text-brand-mango' : 'text-brand-dark'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
