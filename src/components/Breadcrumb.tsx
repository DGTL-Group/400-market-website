import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href?: string
}

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="max-w-content mx-auto px-6 md:px-20 py-4 text-body-sm text-text-secondary">
      {items.map((item, i) => (
        <span key={i}>
          {i > 0 && <span className="mx-2">&rsaquo;</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-brand-mango transition-colors duration-500">
              {item.label}
            </Link>
          ) : (
            <span className="text-text-primary">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
