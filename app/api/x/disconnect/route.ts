// POST /api/x/disconnect — Clears X OAuth cookies to disconnect account

import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  response.cookies.delete('x_access_token')
  response.cookies.delete('x_refresh_token')
  response.cookies.delete('x_user')

  return response
}
