/**
 * export-notion-data.js
 *
 * Exports the Ballketing Content Resources Notion database to:
 *   src/data/library.json  — one entry per resource
 *   src/data/stats.json    — aggregate counts
 *
 * Usage:
 *   1. Create a .env file in this folder with:
 *        NOTION_TOKEN=your_integration_token
 *        NOTION_DATABASE_ID=your_database_id
 *   2. Run: node export-notion-data.js
 *
 * The Notion integration must have read access to the database.
 */

import { Client } from '@notionhq/client'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const __dirname = dirname(fileURLToPath(import.meta.url))

// ─── Config ──────────────────────────────────────────────────────────────────

const NOTION_TOKEN = process.env.NOTION_TOKEN
const DATABASE_ID  = process.env.NOTION_DATABASE_ID

if (!NOTION_TOKEN || !DATABASE_ID) {
  console.error('\nMissing environment variables. Create a .env file with:')
  console.error('  NOTION_TOKEN=your_integration_token')
  console.error('  NOTION_DATABASE_ID=your_database_id\n')
  process.exit(1)
}

const notion = new Client({ auth: NOTION_TOKEN })

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract plain text from a Notion rich_text or title array */
function richText(arr) {
  if (!arr || !Array.isArray(arr)) return ''
  return arr.map(t => t.plain_text ?? '').join('').trim()
}

/** Extract values from a Notion multi_select property */
function multiSelect(prop) {
  if (!prop || !Array.isArray(prop.multi_select)) return []
  return prop.multi_select.map(s => s.name).filter(Boolean)
}

/** Extract value from a Notion select property */
function select(prop) {
  if (!prop || !prop.select) return null
  return prop.select.name ?? null
}

/** Extract URL from a Notion url property */
function url(prop) {
  if (!prop) return null
  return prop.url ?? null
}

/** Extract date string from a Notion date property */
function date(prop) {
  if (!prop || !prop.date) return null
  return prop.date.start ?? null
}

// ─── Retry helper ─────────────────────────────────────────────────────────────

async function withRetry(fn, retries = 4, baseDelayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn()
    } catch (err) {
      if (attempt === retries) throw err
      const delay = baseDelayMs * attempt
      console.log(`  ⚠ Attempt ${attempt} failed (${err.message}), retrying in ${delay / 1000}s...`)
      await new Promise(r => setTimeout(r, delay))
    }
  }
}

// ─── Fetch all pages from the database (handles pagination) ──────────────────

async function fetchAllPages() {
  const pages = []
  let cursor = undefined

  console.log('Fetching pages from Notion...')

  let pageNum = 0

  while (true) {
    pageNum++
    const response = await withRetry(() => notion.databases.query({
      database_id: DATABASE_ID,
      start_cursor: cursor,
      page_size: 100,
    }))

    const batchSize = response.results.length
    pages.push(...response.results)

    console.log(`  Page ${pageNum}: got ${batchSize} entries (running total: ${pages.length}) | has_more: ${response.has_more}`)

    if (!response.has_more) {
      console.log('  → Notion says no more pages. Stopping.')
      break
    }

    cursor = response.next_cursor
    console.log(`  → Next cursor: ${cursor}`)
  }

  console.log(`\nTotal raw entries from Notion API: ${pages.length}`)
  return pages
}

// ─── Transform a Notion page into our clean data shape ───────────────────────

function transformPage(page) {
  const p = page.properties

  return {
    id: page.id,
    name:       richText(p['Name']?.title),
    summary:    richText(p['Summary']?.rich_text),
    categories: multiSelect(p['Category']),
    types:      multiSelect(p['Type']),
    publishers: multiSelect(p['Publisher: Who / Where']),
    link:       url(p['Link to content']),
    dateAdded:  date(p['Date added']),
    score:      select(p['Score /5']),
  }
}

// ─── Generate stats ───────────────────────────────────────────────────────────

function generateStats(entries) {
  const byCategory  = {}
  const byType      = {}
  const byPublisher = {}

  for (const entry of entries) {
    for (const cat of entry.categories) {
      byCategory[cat] = (byCategory[cat] ?? 0) + 1
    }
    for (const t of entry.types) {
      byType[t] = (byType[t] ?? 0) + 1
    }
    for (const pub of entry.publishers) {
      byPublisher[pub] = (byPublisher[pub] ?? 0) + 1
    }
  }

  // Sort publisher counts descending, keep top 20
  const topPublishers = Object.entries(byPublisher)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})

  return {
    total: entries.length,
    byCategory:  Object.fromEntries(Object.entries(byCategory).sort((a, b) => b[1] - a[1])),
    byType:      Object.fromEntries(Object.entries(byType).sort((a, b) => b[1] - a[1])),
    byPublisher: topPublishers,
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  try {
    const pages   = await fetchAllPages()
    const entries = pages.map(transformPage)
    const stats   = generateStats(entries)

    // Remove entries with no name (draft/empty rows in Notion)
    const clean = entries.filter(e => e.name.length > 0)

    const dataDir = resolve(__dirname, 'src/data')
    mkdirSync(dataDir, { recursive: true })

    writeFileSync(
      resolve(dataDir, 'library.json'),
      JSON.stringify(clean, null, 2),
      'utf8'
    )
    writeFileSync(
      resolve(dataDir, 'stats.json'),
      JSON.stringify({ ...stats, total: clean.length }, null, 2),
      'utf8'
    )

    console.log(`library.json  — ${clean.length} entries written`)
    console.log(`stats.json    — ${Object.keys(stats.byCategory).length} categories, ${Object.keys(stats.byType).length} types`)
    console.log('\nDone. Data saved to src/data/')
  } catch (err) {
    console.error('\nExport failed:', err.message)
    if (err.code === 'unauthorized') {
      console.error('Check your NOTION_TOKEN — the integration may not have access to this database.')
    }
    process.exit(1)
  }
}

main()
