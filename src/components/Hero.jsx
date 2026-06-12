import { useState } from 'react'
import stats from '../data/stats.json'
import OnboardingCards from './OnboardingCards'

// Explicit order for visual balance, typo fixed ("Startups" not "Start ups")
const CATEGORY_ORDER = [
  'Marketing',
  'Strategy',
  'Sports Industry',
  'Leadership',
  'Technology',
  'Business Masterclasses',
  'Startups',
  'Sales',
  'Life Lessons',
  'Social Media',
  'Fitness Industry',
]

// Normalise label for matching (handles "Startups" ↔ "Start ups" in Notion)
const normalise = s => s.toLowerCase().replace(/\s+/g, '')

// Build ordered list, fall back to any extra categories from stats not in the list
const CATEGORIES = [
  ...CATEGORY_ORDER.filter(c =>
    Object.keys(stats.byCategory).some(k => normalise(k) === normalise(c))
  ),
  ...Object.keys(stats.byCategory).filter(
    k => !CATEGORY_ORDER.some(c => normalise(c) === normalise(k))
  ),
]

export default function Hero({ query, onQueryChange, onSearch, activeCategories, onCategoryToggle, queryIsQuestion, onAskQuestion, askLoading, isSearching }) {
  const [searchFocused, setSearchFocused] = useState(false)

  const clearAll = () => {
    onQueryChange('')
    activeCategories.forEach(c => onCategoryToggle(c))
  }

  return (
    <section className="pt-10 pb-8 md:pt-14 md:pb-12" style={{ background: '#FAFAF8' }}>
      <div className="max-w-3xl mx-auto px-6 md:px-8 text-center">

        {/* Headline */}
        <h1
          className="font-serif text-4xl md:text-[3.25rem] leading-tight mb-4"
          style={{ color: '#1A1A1A', letterSpacing: '-0.02em' }}
        >
          The knowledge behind<br className="hidden md:block" /> the business of sport.
        </h1>

        {/* Description */}
        <p
          className="text-base md:text-lg mb-2 mx-auto max-w-xl"
          style={{ color: '#545454', lineHeight: '1.7' }}
        >
          Stop searching. Start knowing. {stats.total.toLocaleString()}+ personally curated sports business resources — each structured for insight, not just reading.
        </p>

        {/* Attribution */}
        <p className="text-sm mb-7" style={{ color: '#545454' }}>
          Curated by{' '}
          <a
            href="https://www.ballketing.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors duration-150 hover:text-[#013d5e]"
            style={{ color: '#025785' }}
          >
            Ballketing
          </a>
          {' '}— the sports business growth studio.
        </p>

        {/* Onboarding cards — visible until user starts interacting */}
        {!isSearching && activeCategories.length === 0 && (
          <OnboardingCards />
        )}

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto mb-3">
          <div
            className="flex items-center bg-white rounded-2xl transition-all duration-200"
            style={{
              border: searchFocused ? '1.5px solid #025785' : '1.5px solid #e4e4e0',
              boxShadow: searchFocused
                ? '0 4px 24px rgba(2,87,133,0.16)'
                : '0 4px 24px rgba(2,87,133,0.08)',
            }}
          >
            <button
              onClick={onSearch}
              className="pl-5 pr-3 flex-shrink-0 cursor-pointer"
              style={{ color: '#b0b0aa' }}
              aria-label="Search"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            <input
              type="text"
              value={query}
              onChange={e => onQueryChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onKeyDown={e => { if (e.key === 'Enter') onSearch() }}
              placeholder="Search by keyword, topic or framework — press Enter to search"
              className="w-full bg-transparent py-4 pr-5 text-[0.95rem] outline-none"
              style={{ color: '#1A1A1A' }}
            />

            {queryIsQuestion && (
              <button
                onClick={onAskQuestion}
                disabled={askLoading}
                className="mr-2 flex-shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150"
                style={{
                  background: askLoading ? '#e4e4e0' : '#025785',
                  color: askLoading ? '#9a9a9a' : '#ffffff',
                  border: 'none',
                }}
              >
                {askLoading ? 'Thinking…' : 'Ask AI'}
              </button>
            )}

            {query && (
              <button
                onClick={() => onQueryChange('')}
                className="pr-4 flex-shrink-0 cursor-pointer"
                style={{ color: '#b0b0aa' }}
                aria-label="Clear search"
              >
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="1" y1="1" x2="13" y2="13" />
                  <line x1="13" y1="1" x2="1" y2="13" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Feature hint */}
        <p className="text-sm italic mb-6" style={{ color: '#9a9a9a' }}>
          Try: "How should a mid-tier football club approach sponsorship?" or search "brand positioning"
        </p>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {CATEGORIES.map(cat => {
            const isActive = activeCategories.includes(cat)
            // Find count from stats, accounting for normalised names
            const count = Object.entries(stats.byCategory).find(
              ([k]) => normalise(k) === normalise(cat)
            )?.[1] ?? null
            return (
              <button
                key={cat}
                onClick={() => onCategoryToggle(cat)}
                className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer flex items-center gap-1.5"
                style={{
                  border: '1.5px solid #025785',
                  background: isActive ? '#025785' : 'transparent',
                  color: isActive ? '#ffffff' : '#025785',
                }}
              >
                {cat}
                {count && (
                  <span style={{ opacity: 0.65, fontSize: '10px' }}>{count}</span>
                )}
              </button>
            )
          })}

          {(activeCategories.length > 0 || query) && (
            <button
              onClick={clearAll}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer"
              style={{ border: '1.5px solid #d0d0cc', color: '#545454' }}
            >
              Clear all ×
            </button>
          )}
        </div>

        {/* Stats line — Change 5 */}
        <p className="text-xs" style={{ color: '#9a9a9a', letterSpacing: '0.02em' }}>
          {stats.total.toLocaleString()} curated resources · {Object.keys(stats.byCategory).length} categories · built by practitioners, not algorithms
        </p>

      </div>

      {/* Visual divider — Change 6 */}
      <div className="flex justify-center mt-10">
        <div style={{ width: '60px', height: '2px', background: '#025785', borderRadius: '2px' }} />
      </div>
    </section>
  )
}
