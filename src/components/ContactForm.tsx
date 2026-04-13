'use client'

import { useState, type FormEvent } from 'react'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm() {
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          subject: data.get('subject'),
          message: data.get('message'),
        }),
      })

      if (!res.ok) throw new Error('Failed to send')
      setStatus('sent')
      form.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-surface-light/60 rounded-button px-8 py-12 text-center">
        <div className="text-[40px] mb-4">&#10003;</div>
        <h3 className="font-body font-bold text-display-sm text-text-primary normal-case tracking-normal mb-2">
          Message sent!
        </h3>
        <p className="font-body text-body-md text-text-secondary">
          We&apos;ll get back to you as soon as possible.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 font-body text-body-sm text-brand-mango font-semibold hover:text-brand-orange transition-colors duration-500"
        >
          Send another message
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
          Your Name
        </label>
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          className="w-full border border-surface-light rounded-button px-4 py-3 font-body text-body-md text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-colors"
        />
      </div>

      <div>
        <label htmlFor="contact-email" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
          Email Address
        </label>
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          className="w-full border border-surface-light rounded-button px-4 py-3 font-body text-body-md text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-colors"
        />
      </div>

      <div>
        <label htmlFor="contact-subject" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          className="w-full border border-surface-light rounded-button px-4 py-3 font-body text-body-md text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-colors"
        />
      </div>

      <div>
        <label htmlFor="contact-message" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="w-full border border-surface-light rounded-button px-4 py-3 font-body text-body-md text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-colors resize-y"
        />
      </div>

      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? 'Sending...' : 'Send Message'}
      </button>

      {status === 'error' && (
        <p className="font-body text-body-sm text-red-600 mt-2">
          Something went wrong. Please try again or email us directly.
        </p>
      )}
    </form>
  )
}
