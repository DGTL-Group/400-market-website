import Link from 'next/link'
import Logo from '@/components/Logo'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark text-white px-4">
      <Logo id="not-found-logo" className="w-[120px] h-[120px] mb-8" />
      <h1 className="font-display text-display-lg uppercase tracking-wide mb-4">
        PAGE NOT FOUND
      </h1>
      <p className="font-body text-body-lg text-text-subtle max-w-md text-center mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn-primary">
        BACK TO HOME
      </Link>
    </div>
  )
}
