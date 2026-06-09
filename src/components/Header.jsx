import { useState, useEffect } from 'react'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="sticky top-0 z-50 bg-white transition-all duration-200"
      style={{
        borderBottom: scrolled ? 'none' : '1px solid #eeeeeb',
        boxShadow: scrolled ? '0 1px 16px rgba(0,0,0,0.07)' : 'none',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
        {/* Logo / wordmark */}
        <div className="flex items-baseline gap-2.5">
          <span
            className="font-serif text-[1.1rem] font-medium tracking-tight"
            style={{ color: '#1A1A1A' }}
          >
            The Sports Business Library
          </span>
          <span
            className="text-xs hidden sm:inline"
            style={{ color: '#9a9a9a', letterSpacing: '0.01em' }}
          >
            powered by Ballketing
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex items-center gap-6">
          <a
            href="https://www.ballketing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors duration-150 hover:text-[#025785]"
            style={{ color: '#545454' }}
          >
            About
          </a>
          <a
            href="https://www.ballketing.com/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm transition-colors duration-150 hover:text-[#025785]"
            style={{ color: '#545454' }}
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  )
}
