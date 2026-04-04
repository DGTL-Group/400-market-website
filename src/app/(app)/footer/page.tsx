import Footer from '@/components/Footer'

const variants = [
  { id: 'A', label: 'Version A — horizontal socials', props: { showTagline: false, headingClass: 'footer-heading-lg', socialLayout: 'horizontal' as const } },
  { id: 'B', label: 'Version B — vertical socials with labels', props: { showTagline: false, headingClass: 'footer-heading-lg', socialLayout: 'vertical' as const } },
]

export default function FooterPreview() {
  return (
    <div>
      {variants.map((v) => (
        <div key={v.id}>
          <div className="bg-surface-light py-10 text-center">
            <p className="text-text-secondary text-body-lg">{v.label}</p>
          </div>
          <Footer {...v.props} />
        </div>
      ))}
    </div>
  )
}
