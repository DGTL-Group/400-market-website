import Header from '@/components/Header'

const variants = [
  { id: 'C' as const, label: 'Variant C — Compact centered, CTA button (90px)' },
  { id: 'D' as const, label: 'Variant D — Compact centered, text CTA (90px)' },
  { id: 'E' as const, label: 'Variant E — Expanded centered, CTA button (110px)' },
  { id: 'F' as const, label: 'Variant F — Expanded centered, text CTA (110px)' },
  { id: 'G' as const, label: 'Variant G — Extra-large centered, text CTA (130px)' },
  { id: 'H' as const, label: 'Variant H — Extra-large centered, CTA button (130px)' },
]

export default function HeaderPreview() {
  return (
    <div>
      {variants.map((v) => (
        <div key={v.id}>
          <div className="bg-surface-light py-6 text-center">
            <p className="text-text-secondary text-body-lg">{v.label}</p>
          </div>
          <Header variant={v.id} />
        </div>
      ))}
    </div>
  )
}
