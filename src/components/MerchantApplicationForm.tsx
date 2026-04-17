'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function MerchantApplicationForm() {
  const [status, setStatus] = useState<Status>('idle')
  // Pre-fillable booth number. Two sources, both optional:
  //   1. `?booth=N` query param (set by FloorPlanSVG via replaceState on click)
  //   2. `floorPlan:boothSelected` window event (same source, immediate update)
  // Visitors who land on the page without interacting with the map just
  // see an empty "Preferred Booth" field they can fill in manually.
  const [booth, setBooth] = useState('')

  useEffect(() => {
    // Hydrate from URL on mount.
    const params = new URLSearchParams(window.location.search)
    const fromUrl = params.get('booth')
    if (fromUrl) setBooth(fromUrl)

    // Listen for booth clicks from the floor plan.
    const onBoothSelected = (e: Event) => {
      const detail = (e as CustomEvent<{ number?: string }>).detail
      if (detail?.number) setBooth(detail.number)
    }
    window.addEventListener('floorPlan:boothSelected', onBoothSelected)
    return () => window.removeEventListener('floorPlan:boothSelected', onBoothSelected)
  }, [])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    const form = e.currentTarget
    const data = new FormData(form)

    try {
      const res = await fetch('/api/merchant-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: data.get('firstName'),
          lastName: data.get('lastName'),
          businessName: data.get('businessName'),
          email: data.get('email'),
          phone: data.get('phone'),
          booth: data.get('booth') || undefined,
          description: data.get('description'),
        }),
      })

      if (!res.ok) throw new Error('Failed to send')
      setStatus('sent')
      form.reset()
      setBooth('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="bg-surface-light/60 rounded-button px-8 py-12 text-center">
        <div className="text-[40px] mb-4">&#10003;</div>
        <h3 className="font-body font-bold text-display-sm text-text-primary normal-case tracking-normal mb-2">
          Application received!
        </h3>
        <p className="font-body text-body-md text-text-secondary">
          Our team will be in touch within 2 business days.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 font-body text-body-sm text-brand-mango font-semibold hover:text-brand-orange transition-colors duration-500"
        >
          Submit another application
        </button>
      </div>
    )
  }

  const inputClasses =
    'w-full border border-surface-light rounded-button px-4 py-3 font-body text-body-md text-text-primary placeholder:text-text-subtle focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow transition-colors'

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="app-firstName" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
            First Name
          </label>
          <input id="app-firstName" name="firstName" type="text" required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="app-lastName" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
            Last Name
          </label>
          <input id="app-lastName" name="lastName" type="text" required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="app-businessName" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
            Business Name
          </label>
          <input id="app-businessName" name="businessName" type="text" required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="app-email" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
            Email Address
          </label>
          <input id="app-email" name="email" type="email" required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="app-phone" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
            Phone Number
          </label>
          <input id="app-phone" name="phone" type="tel" required className={inputClasses} />
        </div>

        <div>
          <label htmlFor="app-booth" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
            Preferred Booth <span className="font-normal text-text-subtle">(optional)</span>
          </label>
          <input
            id="app-booth"
            name="booth"
            type="text"
            value={booth}
            onChange={(e) => setBooth(e.target.value)}
            placeholder="e.g. 1804"
            className={inputClasses}
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="app-description" className="block font-body text-body-sm font-semibold text-text-primary mb-1.5">
            Business Description
          </label>
          <textarea id="app-description" name="description" required rows={4} className={inputClasses + ' resize-y'} />
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <button
          type="submit"
          disabled={status === 'sending'}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {status === 'sending' ? 'Submitting...' : 'Submit Application'}
        </button>
        <span className="font-body text-caption text-text-subtle">
          By submitting you agree to our{' '}
          <Link href="/terms-of-use" className="underline hover:text-brand-mango">Terms of Use</Link>
          {' '}and{' '}
          <Link href="/privacy-policy" className="underline hover:text-brand-mango">Privacy Policy</Link>.
        </span>
      </div>

      {status === 'error' && (
        <p className="font-body text-body-sm text-red-600 mt-3">
          Something went wrong. Please try again or contact us directly.
        </p>
      )}
    </form>
  )
}
