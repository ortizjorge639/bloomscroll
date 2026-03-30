'use client'

import { cn } from '@/lib/utils'

interface RichTextProps {
  text: string
  className?: string
}

const URL_REGEX = /https?:\/\/[^\s\])"'>]+/g
const MENTION_REGEX = /@(\w{1,50})/g
const HASHTAG_REGEX = /#(\w+)/g

type Segment =
  | { kind: 'text'; value: string }
  | { kind: 'url'; value: string }
  | { kind: 'mention'; handle: string }
  | { kind: 'hashtag'; tag: string }

function parseSegments(text: string): Segment[] {
  // Build a list of all token positions: URLs, @mentions, #hashtags
  interface Token { start: number; end: number; segment: Segment }
  const tokens: Token[] = []

  let m: RegExpExecArray | null

  const urlRe = new RegExp(URL_REGEX.source, 'g')
  while ((m = urlRe.exec(text)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, segment: { kind: 'url', value: m[0] } })
  }

  const mentionRe = new RegExp(MENTION_REGEX.source, 'g')
  while ((m = mentionRe.exec(text)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, segment: { kind: 'mention', handle: m[1] } })
  }

  const hashRe = new RegExp(HASHTAG_REGEX.source, 'g')
  while ((m = hashRe.exec(text)) !== null) {
    tokens.push({ start: m.index, end: m.index + m[0].length, segment: { kind: 'hashtag', tag: m[1] } })
  }

  // Sort by start position, remove overlapping (e.g. URL that contains @)
  tokens.sort((a, b) => a.start - b.start)
  const filtered: Token[] = []
  let cursor = 0
  for (const tok of tokens) {
    if (tok.start >= cursor) {
      filtered.push(tok)
      cursor = tok.end
    }
  }

  // Build segments list
  const segments: Segment[] = []
  let pos = 0
  for (const tok of filtered) {
    if (tok.start > pos) {
      segments.push({ kind: 'text', value: text.slice(pos, tok.start) })
    }
    segments.push(tok.segment)
    pos = tok.end
  }
  if (pos < text.length) {
    segments.push({ kind: 'text', value: text.slice(pos) })
  }

  return segments
}

/** Truncates long URLs for display (shows domain + first path segment) */
function displayUrl(url: string): string {
  try {
    const u = new URL(url)
    const path = u.pathname.length > 20 ? u.pathname.slice(0, 20) + '…' : u.pathname
    return u.hostname + path
  } catch {
    return url.length > 40 ? url.slice(0, 40) + '…' : url
  }
}

const linkClass = 'text-primary hover:underline underline-offset-2 break-all'

export function RichText({ text, className }: RichTextProps) {
  const segments = parseSegments(text)

  return (
    <span className={cn('whitespace-pre-wrap', className)}>
      {segments.map((seg, i) => {
        switch (seg.kind) {
          case 'url':
            return (
              <a
                key={i}
                href={seg.value}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={linkClass}
              >
                {displayUrl(seg.value)}
              </a>
            )
          case 'mention':
            return (
              <a
                key={i}
                href={`https://x.com/${seg.handle}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={linkClass}
              >
                @{seg.handle}
              </a>
            )
          case 'hashtag':
            return (
              <a
                key={i}
                href={`https://x.com/hashtag/${seg.tag}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={linkClass}
              >
                #{seg.tag}
              </a>
            )
          default:
            return <span key={i}>{seg.value}</span>
        }
      })}
    </span>
  )
}
