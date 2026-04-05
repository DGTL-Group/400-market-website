import Link from 'next/link'
import Logo from './Logo'

const leftLinks = [
  { label: 'VENDORS', href: '/vendors' },
  { label: 'EVENTS', href: '/events' },
  { label: 'SHOP', href: '/shop' },
]

const rightLinks = [
  { label: 'NEWS', href: '/news' },
  { label: 'ABOUT', href: '/about-us' },
  { label: 'CONTACT', href: '/contact-us' },
]

type Variant = 'C' | 'D' | 'E' | 'F' | 'G' | 'H'

const variantConfig: Record<Variant, {
  height: string
  logoSize: string
  fontSize: string
  gap: string
  padding: string
  logoPad: string
  ctaStyle: 'button' | 'text'
  ctaClasses: string
}> = {
  C: {
    height: 'h-[90px]',
    logoSize: 'w-[62px] h-[62px]',
    fontSize: 'text-[12px]',
    gap: 'gap-8',
    padding: 'px-12',
    logoPad: 'pr-10',
    ctaStyle: 'button',
    ctaClasses: 'bg-brand-yellow text-brand-dark px-[22px] py-3 text-[12px] font-bold rounded-button tracking-wide ml-4 whitespace-nowrap hover:bg-brand-orange transition-colors duration-500',
  },
  D: {
    height: 'h-[90px]',
    logoSize: 'w-[62px] h-[62px]',
    fontSize: 'text-[12px]',
    gap: 'gap-8',
    padding: 'px-12',
    logoPad: 'pr-10',
    ctaStyle: 'text',
    ctaClasses: 'text-brand-yellow text-[12px] font-semibold tracking-wide hover:text-white transition-colors duration-500',
  },
  E: {
    height: 'h-[110px]',
    logoSize: 'w-[78px] h-[78px]',
    fontSize: 'text-[13px]',
    gap: 'gap-9',
    padding: 'px-14',
    logoPad: 'pr-12',
    ctaStyle: 'button',
    ctaClasses: 'bg-brand-yellow text-brand-dark px-[26px] py-3.5 text-[13px] font-bold rounded-button tracking-wide ml-5 whitespace-nowrap hover:bg-brand-orange transition-colors duration-500',
  },
  F: {
    height: 'h-[110px]',
    logoSize: 'w-[78px] h-[78px]',
    fontSize: 'text-[13px]',
    gap: 'gap-9',
    padding: 'px-14',
    logoPad: 'pr-12',
    ctaStyle: 'text',
    ctaClasses: 'text-brand-yellow text-[13px] font-semibold tracking-wide hover:text-white transition-colors duration-500',
  },
  G: {
    height: 'h-[130px]',
    logoSize: 'w-[92px] h-[92px]',
    fontSize: 'text-[15px]',
    gap: 'gap-10',
    padding: 'px-16',
    logoPad: 'pr-14',
    ctaStyle: 'text',
    ctaClasses: 'text-brand-yellow text-[15px] font-semibold tracking-wide hover:text-white transition-colors duration-500',
  },
  H: {
    height: 'h-[130px]',
    logoSize: 'w-[92px] h-[92px]',
    fontSize: 'text-[15px]',
    gap: 'gap-10',
    padding: 'px-16',
    logoPad: 'pr-14',
    ctaStyle: 'button',
    ctaClasses: 'bg-brand-yellow text-brand-dark px-[30px] py-4 text-[15px] font-bold rounded-button tracking-wide ml-6 whitespace-nowrap hover:bg-brand-orange transition-colors duration-500',
  },
}

export default function Header({ variant = 'G' }: { variant?: Variant }) {
  const config = variantConfig[variant]
  const linkClasses = `text-[#c8c8c8] ${config.fontSize} font-semibold tracking-wide hover:text-white transition-colors duration-500`

  return (
    <header className="sticky top-0 z-50">
      {/* Gradient accent bar */}
      <div className="h-[3px] bg-gradient-to-r from-brand-yellow to-brand-orange" />

      {/* Main nav */}
      <nav className={`grid grid-cols-[1fr_auto_1fr] items-center ${config.height} bg-brand-dark ${config.padding}`}>
        {/* Left links */}
        <div className={`flex ${config.gap} justify-end ${config.logoPad}`}>
          {leftLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClasses}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Center logo */}
        <Link href="/" className={`block ${config.logoSize}`}>
          <Logo id={`header-logo-${variant}`} className="w-full h-full" />
        </Link>

        {/* Right links */}
        <div className={`flex ${config.gap} pl-14 items-center`}>
          {rightLinks.map((link) => (
            <Link key={link.href} href={link.href} className={linkClasses}>
              {link.label}
            </Link>
          ))}
          <Link href="/become-a-vendor" className={config.ctaClasses}>
            BECOME A MERCHANT
          </Link>
        </div>
      </nav>
    </header>
  )
}
