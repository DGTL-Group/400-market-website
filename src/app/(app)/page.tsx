import Logo from '@/components/Logo'

export default function Home() {
  return (
    <main className="relative min-h-screen bg-brand-yellow flex flex-col items-center justify-center px-6 pb-24 text-center">

      {/* Logo */}
      <a href="https://400market.com" target="_blank" rel="noopener noreferrer" className="w-32 sm:w-40 mb-10 block">
        <Logo id="home-logo" className="w-full h-auto" />
      </a>

      {/* Headline */}
      <h1 className="font-display text-display-md sm:text-display-lg text-brand-dark tracking-wide mb-4 font-bold">
        SOMETHING EXCITING IS COMING
      </h1>

      {/* Dark accent line */}
      <div className="w-16 h-1 bg-brand-dark rounded-full mb-6" />

      {/* Subtext */}
      <p className="font-body text-body-lg text-text-primary max-w-lg mb-10 leading-relaxed">
        We&apos;re building a brand new home for The 400 Market online.
        Over 140 vendors. Fresh finds every weekend. Same market you&apos;ve loved since 1986 &mdash; now with a fresh new look.
      </p>

      {/* Contact info */}
      <div className="space-y-2 text-body-lg text-brand-dark mt-16">
        <p className="font-semibold">
          <a href="https://share.google/qGvHeXlwOD08Oodyb" target="_blank" rel="noopener noreferrer">
            2207 Industrial Park Rd, Innisfil, ON L9S 3V9
          </a>
        </p>
        <p className="font-semibold">
          <a href="tel:7054361010">705-436-1010</a>
        </p>
      </div>

      {/* Footer — pinned to bottom */}
      <footer className="absolute bottom-6 left-0 right-0 text-caption text-brand-dark text-center">
        <p>&copy; 2026 The 400 Market. All rights reserved.</p>
        <p className="mt-1">
          <a
            href="https://dgtlgroup.io"
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            Designed with{' '}
            <span className="inline-block relative">
              <span className="group-hover:opacity-0 transition-opacity duration-300 ease-in-out">love</span>
              <span className="absolute inset-0 flex items-center justify-center opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 ease-in-out text-red-500">
                &#10084;
              </span>
            </span>
            {' '}by <span className="underline">DGTL Group</span>
          </a>
        </p>
      </footer>
    </main>
  )
}
