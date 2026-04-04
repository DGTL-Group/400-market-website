import Link from 'next/link'
import Logo from '@/components/Logo'
import { metafora, dmSans } from '@/fonts'
import './(app)/globals.css'

export default function NotFound() {
  return (
    <html lang="en" className={`${metafora.variable} ${dmSans.variable}`}>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark text-white px-4">
          <Logo id="not-found-logo" className="w-[120px] h-[120px] mb-8" />
          <h1 className="font-display text-display-lg uppercase tracking-wide mb-4">
            PAGE NOT FOUND
          </h1>
          <p className="font-body text-body-lg text-text-subtle max-w-md text-center mb-8">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-button bg-brand-yellow px-6 py-3 font-display text-body-md uppercase tracking-wide text-brand-dark hover:bg-brand-orange transition-colors duration-500"
          >
            BACK TO HOME
          </Link>
        </div>
      </body>
    </html>
  )
}
