/**
 * Parses a structured summary string into sections for rich rendering.
 *
 * The summary format uses these section headers:
 *   KEY THEMES, MAIN INSIGHTS, FRAMEWORKS & CONCEPTS, NOTABLE QUOTES, ACTION ITEMS
 *
 * Lines are prefixed with:
 *   • for bullets, → for action items, "" for quotes
 */

const SECTION_HEADERS = [
  'KEY THEMES',
  'MAIN INSIGHTS',
  'FRAMEWORKS & CONCEPTS',
  'NOTABLE QUOTES',
  'ACTION ITEMS',
]

export function parseSummary(text) {
  if (!text) return { intro: '', sections: [] }

  // Find the index of the first section header
  const firstIdx = SECTION_HEADERS.reduce((min, header) => {
    const i = text.indexOf(header)
    if (i === -1) return min
    return min === -1 || i < min ? i : min
  }, -1)

  // If no structured headers found, treat the whole text as intro
  const intro = firstIdx > 0 ? text.slice(0, firstIdx).trim() : (firstIdx === -1 ? text.trim() : '')
  const body  = firstIdx > 0 ? text.slice(firstIdx) : (firstIdx === -1 ? '' : text)

  const sections = []

  SECTION_HEADERS.forEach((header, idx) => {
    const start = body.indexOf(header)
    if (start === -1) return

    // Find where this section ends (start of the next found section)
    let end = body.length
    for (let j = idx + 1; j < SECTION_HEADERS.length; j++) {
      const next = body.indexOf(SECTION_HEADERS[j], start + header.length)
      if (next !== -1 && next < end) end = next
    }

    const content = body.slice(start + header.length, end).trim()
    const lines = content
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean)

    sections.push({ title: header, lines })
  })

  return { intro, sections }
}
