import { useEffect } from 'react'
import { parseSummary } from '../utils/parseSummary'

export default function CardModal({ entry, onClose }) {
  const { intro, sections } = parseSummary(entry.summary)

  const formattedDate = entry.dateAdded
    ? new Date(entry.dateAdded).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  // Close on Escape key
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    // Prevent body scroll while modal is open
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 md:p-8 overflow-y-auto"
      style={{ background: 'rgba(10,20,30,0.55)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      {/* Modal panel */}
      <div
        className="relative bg-white rounded-2xl w-full max-w-2xl my-auto"
        style={{ boxShadow: '0 24px 80px rgba(0,0,0,0.18)', marginTop: '2rem', marginBottom: '2rem' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-150 cursor-pointer"
          style={{ background: '#f5f5f2', color: '#545454' }}
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="1" y1="1" x2="13" y2="13" />
            <line x1="13" y1="1" x2="1" y2="13" />
          </svg>
        </button>

        <div className="p-8 md:p-10">
          {/* Metadata row */}
          <div className="flex flex-wrap items-center gap-2 mb-5">
            {entry.publishers?.[0] && (
              <span className="text-xs font-medium" style={{ color: '#025785' }}>
                {entry.publishers[0]}
              </span>
            )}
            {entry.types?.[0] && (
              <>
                <span style={{ color: '#d0d0cc', fontSize: '10px' }}>●</span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: '#f5f5f2', color: '#545454' }}
                >
                  {entry.types[0]}
                </span>
              </>
            )}
            {formattedDate && (
              <span className="text-xs ml-auto" style={{ color: '#b0b0aa' }}>
                {formattedDate}
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            className="font-serif text-2xl md:text-3xl font-medium leading-snug mb-5"
            style={{ color: '#1A1A1A', letterSpacing: '-0.02em' }}
          >
            {entry.name}
          </h2>

          {/* Category chips */}
          {entry.categories?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-7">
              {entry.categories.map(cat => (
                <span
                  key={cat}
                  className="text-xs px-2.5 py-0.5 rounded-full"
                  style={{ border: '1px solid #c8dfe8', color: '#025785', background: '#f0f7fa' }}
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          {/* Intro / unstructured summary */}
          {intro && (
            <div className="flex flex-col gap-3 mb-8">
              {intro
                .split('\n')
                .map(l => l.trim())
                .filter(Boolean)
                .map((para, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed"
                    style={{ color: '#3a3a3a', lineHeight: '1.8' }}
                  >
                    {para.replace(/\*\*([^*]+)\*\*/g, '$1')}
                  </p>
                ))
              }
            </div>
          )}

          {/* Divider */}
          {sections.length > 0 && (
            <div style={{ borderTop: '1px solid #eeeeeb', marginBottom: '1.75rem' }} />
          )}

          {/* Sections */}
          <div className="flex flex-col gap-8">
            {sections.map(section => (
              <SummarySection key={section.title} section={section} />
            ))}
          </div>

          {/* Source link */}
          {entry.link && (
            <div
              className="mt-10 pt-6"
              style={{ borderTop: '1px solid #eeeeeb' }}
            >
              <a
                href={entry.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium transition-colors duration-150 hover:text-[#013d5e]"
                style={{ color: '#025785' }}
              >
                View original source
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="7" y1="17" x2="17" y2="7" />
                  <polyline points="7 7 17 7 17 17" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* Renders one section (KEY THEMES, NOTABLE QUOTES, etc.) */
function SummarySection({ section }) {
  return (
    <div>
      {/* Section heading */}
      <h3
        className="text-xs font-medium uppercase tracking-widest mb-4"
        style={{ color: '#025785', letterSpacing: '0.1em' }}
      >
        {section.title}
      </h3>

      {section.title === 'NOTABLE QUOTES' ? (
        <div className="flex flex-col gap-4">
          {section.lines.map((line, i) => (
            <blockquote
              key={i}
              className="pl-4 font-serif text-base italic"
              style={{
                borderLeft: '3px solid #025785',
                color: '#2a2a2a',
                lineHeight: '1.7',
              }}
            >
              {line.replace(/^[""]|[""]$/g, '').replace(/^"|"$/g, '')}
            </blockquote>
          ))}
        </div>
      ) : section.title === 'ACTION ITEMS' ? (
        <div className="flex flex-col gap-3">
          {section.lines.map((line, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl px-4 py-3 text-sm"
              style={{ background: '#f0f7fa', color: '#1A1A1A', lineHeight: '1.7' }}
            >
              <span style={{ color: '#025785', fontWeight: 600, flexShrink: 0, marginTop: '1px' }}>→</span>
              <span>{line.replace(/^→\s*/, '')}</span>
            </div>
          ))}
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {section.lines.map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 text-sm"
              style={{ color: '#2a2a2a', lineHeight: '1.7' }}
            >
              <span style={{ color: '#025785', flexShrink: 0, marginTop: '3px' }}>•</span>
              <span>{line.replace(/^[•·]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
