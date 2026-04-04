import Footer from '@/components/Footer'

export default function FooterPreview() {
  return (
    <div>
      {/* Version A — with tagline */}
      <div className="bg-surface-light py-10 text-center">
        <p className="text-text-secondary text-body-lg">Version A — with tagline</p>
      </div>
      <Footer showTagline={true} />

      {/* Version B — without tagline */}
      <div className="bg-surface-light py-10 text-center mt-16">
        <p className="text-text-secondary text-body-lg">Version B — without tagline</p>
      </div>
      <Footer showTagline={false} />

      {/* Version C — with tagline, larger headings */}
      <div className="bg-surface-light py-10 text-center mt-16">
        <p className="text-text-secondary text-body-lg">Version C — with tagline, larger headings</p>
      </div>
      <Footer showTagline={true} headingClass="footer-heading-lg" />

      {/* Version D — without tagline, larger headings */}
      <div className="bg-surface-light py-10 text-center mt-16">
        <p className="text-text-secondary text-body-lg">Version D — without tagline, larger headings</p>
      </div>
      <Footer showTagline={false} headingClass="footer-heading-lg" />
    </div>
  )
}
