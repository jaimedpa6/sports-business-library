/**
 * netlify/functions/ask.js
 *
 * AI advisor endpoint — receives a question + relevant library entries,
 * calls Claude, and returns a structured answer with sources.
 */

import Anthropic from '@anthropic-ai/sdk'
import Fuse from 'fuse.js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const library = JSON.parse(readFileSync(join(__dirname, '../../src/data/library.json'), 'utf8'))

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Build Fuse index at cold-start
const fuse = new Fuse(library, {
  keys: [
    { name: 'name',       weight: 3 },
    { name: 'summary',    weight: 2 },
    { name: 'categories', weight: 1 },
    { name: 'publishers', weight: 1 },
  ],
  threshold: 0.35,
  ignoreLocation: true,
  minMatchCharLength: 2,
})

function findRelevantEntries(question, n = 8) {
  return fuse.search(question, { limit: n }).map(r => r.item)
}

function buildContext(entries) {
  return entries.map((e, i) => {
    const summary = e.summary ? e.summary.slice(0, 600) : 'No summary available.'
    return `[${i + 1}] "${e.name}" (${(e.categories || []).join(', ')})\n${summary}`
  }).join('\n\n---\n\n')
}

const SYSTEM_PROMPT = `You are the Sports Business Library advisor — an expert in sports business, marketing, strategy, and the business of sport. You answer questions using the curated library of resources provided as context.

Guidelines:
- Answer in a structured, practical way
- Reference specific resources by their number [1], [2] etc. when drawing from them
- Be direct and actionable — this audience works in sports business
- If the context doesn't fully cover the question, say so and answer from general expertise
- Keep answers focused: 3-5 key points max, each with 1-2 sentences
- End with a "Sources" section listing the numbered resources you referenced`

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  let question
  try {
    const body = await req.json()
    question = body.question?.trim()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  if (!question || question.length < 5) {
    return new Response('Question too short', { status: 400 })
  }

  if (question.length > 500) {
    return new Response('Question too long', { status: 400 })
  }

  try {
    const entries = findRelevantEntries(question)
    const context = buildContext(entries)
    const userMessage = `Question: ${question}\n\nRelevant library resources:\n\n${context}`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })

    const answer = response.content[0]?.text || 'No answer generated.'

    const sources = entries.map(e => ({
      name: e.name,
      link: e.link,
      categories: e.categories,
    }))

    return new Response(
      JSON.stringify({ answer, sources }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('Ask function error:', err)
    return new Response(
      JSON.stringify({ error: 'Something went wrong. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const config = {
  path: '/api/ask',
}
