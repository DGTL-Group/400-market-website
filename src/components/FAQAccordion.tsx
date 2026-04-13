'use client'

import { useState } from 'react'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

type FAQItem = {
  id: string
  question: string
  answer: SerializedEditorState
}

type FAQGroup = {
  label: string
  items: FAQItem[]
}

export default function FAQAccordion({ groups }: { groups: FAQGroup[] }) {
  const [open, setOpen] = useState<string | null>(null)

  function toggle(id: string) {
    setOpen((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.label}>
          <h2 className="font-display text-display-sm uppercase tracking-wide text-brand-dark font-black mb-1">
            {group.label}
          </h2>
          <div className="divide-y divide-surface-light border-t border-surface-light">
            {group.items.map((item) => {
              const isOpen = open === item.id
              return (
                <div key={item.id}>
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    className="w-full flex items-center justify-between py-4 text-left group"
                  >
                    <span className="font-body text-body-md text-text-primary pr-4">
                      {item.question}
                    </span>
                    <span
                      className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-text-secondary group-hover:text-brand-mango transition-colors duration-300"
                      aria-hidden="true"
                    >
                      {isOpen ? '\u2212' : '+'}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-[1000px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="prose prose-sm max-w-none font-body text-text-secondary">
                      <RichText data={item.answer} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
