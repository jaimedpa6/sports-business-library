export default function LibraryCard({ entry, onClick, index = 0 }) {
  const preview = entry.summary
    ? entry.summary.replace(/\n/g, ' ').slice(0, 180).trim()
    : null

  const formattedDate = entry.dateAdded
    ? new Date(entry.dateAdded).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : null

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.()}
      className="card-enter bg-white rounded-2xl p-6 flex flex-col gap-3 cursor-pointer transition-all duration-200"
      style={{
        border: '1px solid #eeeeeb',
        animationDelay: `${Math.min(index * 40, 300)}ms`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(2,87,133,0.10)'
        e.currentTarget.style.borderColor = '#d4e8f0'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = '#eeeeeb'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Publisher + Type row */}
      <div className="flex items-center gap-2 flex-wrap">
        {entry.publishers?.[0] && (
          <span className="text-xs font-medium" style={{ color: '#545454' }}>
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
          <span className="ml-auto text-xs" style={{ color: '#b0b0aa' }}>
            {formattedDate}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className="font-serif text-base font-medium leading-snug"
        style={{ color: '#1A1A1A' }}
      >
        {entry.name}
      </h3>

      {/* Summary preview */}
      {preview && (
        <p className="text-sm leading-relaxed flex-1" style={{ color: '#6a6a6a' }}>
          {preview}{preview.length >= 180 ? '…' : ''}
        </p>
      )}

      {/* Category chips */}
      {entry.categories?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {entry.categories.slice(0, 3).map(cat => (
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
    </div>
  )
}
