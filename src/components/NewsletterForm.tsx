'use client'

export default function NewsletterForm() {
  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex">
      <input
        type="email"
        placeholder="your@email.com"
        className="bg-[#444] border-none text-[#aaa] px-4 py-3 text-[13px] w-[180px] outline-none placeholder:text-[#aaa] focus:ring-1 focus:ring-brand-yellow"
      />
      <button
        type="submit"
        className="bg-brand-yellow text-brand-dark px-5 py-3 font-bold text-[13px] hover:bg-brand-orange transition-colors"
      >
        SUBSCRIBE
      </button>
    </form>
  )
}
