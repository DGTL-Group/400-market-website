'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const filters = [
  { label: 'Upcoming', value: '' },
  { label: 'This Month', value: 'month' },
  { label: 'All Events', value: 'all' },
  { label: 'Past', value: 'past' },
]

function EventsFilterInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const active = searchParams.get('view') || ''

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('view', value)
    } else {
      params.delete('view')
    }
    params.delete('page')
    router.push(`/events?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="bg-surface-light/60">
      <div className="max-w-content mx-auto px-6 md:px-20 py-4 flex flex-wrap items-center gap-3">
        {filters.map((f) => (
          <button
            key={f.value || 'upcoming'}
            onClick={() => handleClick(f.value)}
            className={`px-5 py-2.5 rounded-button text-[13px] font-bold uppercase tracking-wide transition-colors duration-500 ${
              active === f.value
                ? 'bg-brand-yellow text-brand-dark'
                : 'bg-white text-text-secondary hover:bg-brand-yellow/30 hover:text-brand-dark'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EventsFilter() {
  return (
    <Suspense
      fallback={
        <div className="bg-surface-light/60">
          <div className="max-w-content mx-auto px-6 md:px-20 py-4 flex flex-wrap gap-3">
            {filters.map((f) => (
              <div
                key={f.value || 'upcoming'}
                className="px-5 py-2.5 rounded-button bg-white text-[13px] font-bold uppercase tracking-wide text-text-secondary"
              >
                {f.label}
              </div>
            ))}
          </div>
        </div>
      }
    >
      <EventsFilterInner />
    </Suspense>
  )
}
