import Link from 'next/link'
import Logo from '@/components/Logo'
import WhackAVendor from '@/components/WhackAVendor'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-brand-dark text-white px-4 py-8 sm:py-12">
      <Logo id="not-found-logo" className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] mb-4 sm:mb-6" />
      <div className="font-display font-medium text-[4rem] sm:text-[5rem] md:text-[6rem] text-brand-yellow tracking-widest leading-none mb-2 sm:mb-3">
        404
      </div>
      <h1 className="font-display text-display-sm sm:text-display-md md:text-display-lg uppercase tracking-wide mb-4 sm:mb-6 text-center">
        LOOKS LIKE YOU&apos;RE LOST
      </h1>
      <p className="font-body text-body-sm sm:text-body-md text-text-subtle max-w-md text-center mb-6 sm:mb-10 px-2">
        The page you&apos;re looking for has wandered off. While you&apos;re here, try to whack some vendors.
      </p>
      <WhackAVendor />
      <Link
        href="/"
        className="mt-6 sm:mt-10 inline-flex items-center gap-2 font-body font-bold text-[13px] uppercase tracking-wide text-text-subtle hover:text-brand-yellow transition-colors duration-300"
      >
        <span aria-hidden className="text-base leading-none">&larr;</span>
        <span>Skip the game and go home</span>
      </Link>
    </div>
  )
}
