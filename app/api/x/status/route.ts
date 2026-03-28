// GET /api/x/status — Returns whether X OAuth is configured and user connected

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const configured = !!(process.env.X_CLIENT_ID && process.env.X_CLIENT_SECRET)

  const cookieStore = await cookies()
  const userCookie = cookieStore.get('x_user')?.value
  const hasToken = !!(
    cookieStore.get('x_access_token')?.value ||
    cookieStore.get('x_refresh_token')?.value
  )

  let user: { id: string; name: string; username: string; avatar?: string } | null = null
  if (userCookie && hasToken) {
    try {
      user = JSON.parse(userCookie)
    } catch {
      // ignore
    }
  }

  return NextResponse.json({
    configured,
    connected: !!user && hasToken,
    user,
  })
}
