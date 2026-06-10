export default function AskPanel({ question, answer, sources, loading, error, onClose }) {
  return (
    <section
      className="max-w-3xl mx-auto px-6 md:px-10 pt-8 pb-2"
    >
      <div
        className="rounded-2xl p-6 md:p-8"
        style={{
          background: '#f0f7fa',
          border: '1.5px solid #c8dfe8',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-2">
            <div
              className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: '#025785' }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="text-xs font-medium" style={{ color: '#025785' }}>
              Sports Business Library · AI Advisor
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 cursor-pointer transition-colors duration-150"
            style={{ color: '#b0b0aa' }}
            aria-label="Close answer"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="1" y1="1" x2="13" y2="13" />
              <line x1="13" y1="1" x2="1" y2="13" />
            </svg>
          </button>
        </div>

        {/* Question */}
        <p
          className="font-serif text-lg font-medium mb-4 leading-snug"
          style={{ color: '#1A1A1A' }}
        >
          {question}
        </p>

        {/* Loading state */}
        {loading && !answer && (
          <div className="flex items-center gap-2 py-4">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#025785',
                    opacity: 0.4,
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <span className="text-sm" style={{ color: '#545454' }}>
              Searching the library…
            </span>
          </div>
        )}

        {/* Error state */}
        {error && (
          <p className="text-sm py-2" style={{ color: '#c0392b' }}>{error}</p>
        )}

        {/* Answer */}
        {answer && (
          <div
            className="text-sm leading-relaxed whitespace-pre-wrap"
            style={{ color: '#2a2a2a' }}
          >
            {answer}
          </div>
        )}

        {/* Sources */}
        {sources.length > 0 && !loading && (
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #c8dfe8' }}>
            <p className="text-xs font-medium mb-2" style={{ color: '#025785' }}>
              Resources referenced
            </p>
            <div className="flex flex-col gap-1.5">
              {sources.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xs flex-shrink-0 mt-0.5" style={{ color: '#b0b0aa' }}>
                    [{i + 1}]
                  </span>
                  {s.link ? (
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs transition-colors duration-150 hover:underline"
                      style={{ color: '#025785' }}
                    >
                      {s.name}
                    </a>
                  ) : (
                    <span className="text-xs" style={{ color: '#545454' }}>{s.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        {answer && !loading && (
          <p className="text-xs mt-4" style={{ color: '#9a9a9a' }}>
            Answer generated from the Sports Business Library. Always verify with original sources.
          </p>
        )}
      </div>

    </section>
  )
}
