import { NextResponse } from 'next/server'

const VM_URL = process.env.VM_BOOKMARKS_URL ?? 'http://52.139.34.20:3002'

export async function GET() {
  const res = await fetch(`${VM_URL}/bookmarks`, { next: { revalidate: 0 } })
  if (!res.ok) {
    return NextResponse.json({ error: `VM returned ${res.status}` }, { status: res.status })
  }
  const data = await res.json()
  return NextResponse.json(data)
}
