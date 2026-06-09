import stats from '../data/stats.json'

const STEPS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    title: 'Search the library',
    description: `Type any keyword, topic, author, or framework. Results update instantly across ${stats.total.toLocaleString()}+ curated resources.`,
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    title: 'Explore by category',
    description: 'Filter by Marketing, Strategy, Leadership, Technology and more. Each resource is tagged and structured for fast discovery.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Ask a strategic question',
    description: 'Type a question like "How should a football club approach sponsorship?" and get an AI answer drawn directly from the library.',
  },
]

export default function OnboardingCards() {
  return (
    <div className="w-full mb-7 mt-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="rounded-2xl p-6 flex flex-col gap-3"
            style={{
              background: '#ffffff',
              border: '1px solid #eeeeeb',
            }}
          >
            {/* Icon */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: '#f0f7fa', color: '#025785' }}
            >
              {step.icon}
            </div>

            {/* Title */}
            <h3
              className="font-serif text-base font-medium leading-snug"
              style={{ color: '#1A1A1A' }}
            >
              {step.title}
            </h3>

            {/* Description */}
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#6a6a6a', lineHeight: '1.7' }}
            >
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
