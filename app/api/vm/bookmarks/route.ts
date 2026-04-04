import { NextResponse } from 'next/server'

const VM_URL = process.env.VM_BOOKMARKS_URL ?? 'http://52.139.34.20:3002'

export async function GET() {
  const res = await fetch(`${VM_URL}/bookmarks`, { next: { revalidate: 0 } })
  if (!res.ok) {
    return NextResponse.json({ error: `VM returned ${res.status}` }, { status: res.status })
  }
  const data = await res.json()

  // Transform VM format → BloomScroll import format
  const bookmarks = (data.bookmarks ?? []).map((b: {
    id: string
    author: string
    handle: string
    content: string
    url: string
    scrapedAt: string
  }) => ({
    url: b.url,
    text: b.content,
    author: { name: b.author, handle: b.handle },
    timestamp: new Date(b.scrapedAt).getTime(),
  }))

  return NextResponse.json({ bookmarks, exportedAt: data.exportedAt })
}
