'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const tags = [
  { label: 'All', value: '' },
  { label: 'Filter 1', value: 'filter1' },
  { label: 'Filter 2', value: 'filter2' },
  { label: 'Filter 3', value: 'filter3' },
  { label: 'Filter 4', value: 'filter4' },
  { label: 'Filter 5', value: 'filter5' },
]

function TagFilterInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTag = searchParams.get('tag') || ''

  function handleClick(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('tag', value)
    } else {
      params.delete('tag')
    }
    router.push(`/news?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <button
          key={tag.value}
          onClick={() => handleClick(tag.value)}
          className={`px-4 py-2 rounded-button text-body-sm font-semibold transition-colors duration-500 ${
            activeTag === tag.value
              ? 'bg-brand-yellow text-brand-dark'
              : 'bg-surface-light text-text-secondary hover:bg-brand-yellow/20 hover:text-brand-dark'
          }`}
        >
          {tag.label}
        </button>
      ))}
    </div>
  )
}

export default function TagFilter() {
  return (
    <Suspense fallback={<div className="flex gap-2">{tags.map((t) => <div key={t.value} className="px-4 py-2 rounded-button bg-surface-light text-body-sm">{t.label}</div>)}</div>}>
      <TagFilterInner />
    </Suspense>
  )
}
