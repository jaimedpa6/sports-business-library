import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Fuse from 'fuse.js'
import Hero from '../components/Hero'
import LibraryCard from '../components/LibraryCard'
import CardModal from '../components/CardModal'
import AskPanel from '../components/AskPanel'
import library from '../data/library.json'

// Sort by date added descending
const sorted = [...library].sort((a, b) => {
  if (!a.dateAdded && !b.dateAdded) return 0
  if (!a.dateAdded) return 1
  if (!b.dateAdded) return -1
  return new Date(b.dateAdded) - new Date(a.dateAdded)
})

// Fuse.js instance — searches title, summary, publishers, categories
const fuse = new Fuse(sorted, {
  keys: [
    { name: 'name',       weight: 3 },
    { name: 'summary',    weight: 2 },
    { name: 'publishers', weight: 1 },
    { name: 'categories', weight: 1 },
  ],
  threshold: 0.35,
  includeScore: false,
  ignoreLocation: true,
  minMatchCharLength: 2,
})

// Detect if a query looks like a question
const QUESTION_WORDS = /^(how|what|why|when|who|where|which|is|are|can|should|does|do|will|would|could)\b/i
function isQuestion(text) {
  const t = text.trim()
  return t.endsWith('?') || QUESTION_WORDS.test(t)
}

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [activeCategories, setActiveCategories] = useState([])
  const [selectedEntry, setSelectedEntry] = useState(null)

  // AI ask state
  const [askAnswer, setAskAnswer] = useState('')
  const [askSources, setAskSources] = useState([])
  const [askLoading, setAskLoading] = useState(false)
  const [askError, setAskError] = useState(null)
  const [askedQuestion, setAskedQuestion] = useState('')
  const abortRef = useRef(null)

  function toggleCategory(cat) {
    setActiveCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  // Normalise a category label for comparison (handles "Startups" ↔ "Start ups")
  const normalise = s => s.toLowerCase().replace(/\s+/g, '')

  const trimmedQuery = query.trim()
  const queryIsQuestion = trimmedQuery.length >= 10 && isQuestion(trimmedQuery)

  const displayed = useMemo(() => {
    // Start with search results or full sorted list — always newest first
    let results = trimmedQuery.length >= 2
      ? fuse.search(trimmedQuery).map(r => r.item).sort((a, b) => {
          if (!a.dateAdded && !b.dateAdded) return 0
          if (!a.dateAdded) return 1
          if (!b.dateAdded) return -1
          return new Date(b.dateAdded) - new Date(a.dateAdded)
        })
      : sorted

    // Apply category filter on top of search results
    if (activeCategories.length > 0) {
      results = results.filter(entry =>
        entry.categories.some(ec =>
          activeCategories.some(ac => normalise(ac) === normalise(ec))
        )
      )
    }

    // Default view: cap at 12 most recent; searching or filtering: show all matches
    return (trimmedQuery.length >= 2 || activeCategories.length > 0) ? results : results.slice(0, 12)
  }, [trimmedQuery, activeCategories])

  const isSearching = trimmedQuery.length >= 2

  const sectionLabel = isSearching
    ? `${displayed.length} result${displayed.length !== 1 ? 's' : ''} for "${trimmedQuery}"`
    : activeCategories.length > 0
      ? `${activeCategories.join(' · ')} — ${displayed.length} resources`
      : 'Recently added'

  const askQuestion = useCallback(async () => {
    if (!trimmedQuery || askLoading) return

    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setAskLoading(true)
    setAskAnswer('')
    setAskSources([])
    setAskError(null)
    setAskedQuestion(trimmedQuery)

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmedQuery }),
        signal: controller.signal,
      })

      if (!res.ok) throw new Error('Request failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))
            if (data.text) setAskAnswer(prev => prev + data.text)
            if (data.sources) setAskSources(data.sources)
            if (data.error) setAskError(data.error)
          } catch {
            // ignore malformed chunks
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setAskError('Something went wrong. Please try again.')
      }
    } finally {
      setAskLoading(false)
    }
  }, [trimmedQuery, askLoading])

  function clearAsk() {
    if (abortRef.current) abortRef.current.abort()
    setAskAnswer('')
    setAskSources([])
    setAskError(null)
    setAskedQuestion('')
    setAskLoading(false)
  }

  function handleQueryChange(val) {
    setQuery(val)
    // Clear AI answer when query changes
    if (askAnswer || askLoading) clearAsk()
  }

  const showAskPanel = askedQuestion && (askLoading || askAnswer || askError)

  // Scroll to results when search or filter activates
  const resultsRef = useRef(null)
  useEffect(() => {
    if ((isSearching || activeCategories.length > 0) && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [trimmedQuery, activeCategories.length])

  return (
    <main>
      <Hero
        query={query}
        onQueryChange={handleQueryChange}
        activeCategories={activeCategories}
        onCategoryToggle={toggleCategory}
        queryIsQuestion={queryIsQuestion}
        onAskQuestion={askQuestion}
        askLoading={askLoading}
        isSearching={isSearching}
      />

      {/* AI Answer panel */}
      {showAskPanel && (
        <AskPanel
          question={askedQuestion}
          answer={askAnswer}
          sources={askSources}
          loading={askLoading}
          error={askError}
          onClose={clearAsk}
        />
      )}

      {/* Library grid */}
      <section ref={resultsRef} className="max-w-6xl mx-auto px-6 md:px-10 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2
            className="font-serif text-xl font-medium"
            style={{ color: '#1A1A1A' }}
          >
            {sectionLabel}
          </h2>
          <span className="text-xs" style={{ color: '#9a9a9a' }}>
            {library.length} total resources
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {displayed.map((entry, i) => (
            <LibraryCard
              key={entry.id}
              entry={entry}
              index={i}
              onClick={() => setSelectedEntry(entry)}
            />
          ))}
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-20">
            <p className="font-serif text-lg mb-2" style={{ color: '#1A1A1A' }}>
              {isSearching ? 'No results found.' : 'No resources in this category yet.'}
            </p>
            <p className="text-sm" style={{ color: '#9a9a9a' }}>
              {isSearching ? 'Try different keywords or broaden your search.' : 'Try selecting a different filter above.'}
            </p>
          </div>
        )}
      </section>

      {/* Expanded card modal */}
      {selectedEntry && (
        <CardModal
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
        />
      )}
    </main>
  )
}
