/**
 * netlify/functions/ask.js
 *
 * AI advisor endpoint — receives a question + relevant library entries,
 * calls Claude, and streams a structured answer back.
 */

import Anthropic from '@anthropic-ai/sdk'
import Fuse from 'fuse.js'
import library from '../../src/data/library.json' assert { type: 'json' }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// Build Fuse index at cold-start (reused across warm invocations)
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

/** Find the top N most relevant entries for a given question */
function findRelevantEntries(question, n = 8) {
  const results = fuse.search(question, { limit: n })
  return results.map(r => r.item)
}

/** Format entries as context for Claude */
function buildContext(entries) {
  return entries.map((e, i) => {
    const summary = e.summary ? e.summary.slice(0, 600) : 'No summary available.'
    return `[${i + 1}] "${e.name}" (${e.categories.join(', ')})\n${summary}`
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

  const entries = findRelevantEntries(question)
  const context = buildContext(entries)

  const userMessage = `Question: ${question}\n\nRelevant library resources:\n\n${context}`

  // Stream the response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await client.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: userMessage }],
          stream: true,
        })

        for await (const event of response) {
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            const chunk = `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
            controller.enqueue(new TextEncoder().encode(chunk))
          }
        }

        // Send the source entries at the end
        const sources = entries.map(e => ({
          name: e.name,
          link: e.link,
          categories: e.categories,
        }))
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ done: true, sources })}\n\n`)
        )
      } catch (err) {
        console.error('Ask function error:', err)
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify({ error: 'Something went wrong. Please try again.' })}\n\n`)
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}

export const config = {
  path: '/api/ask',
}
