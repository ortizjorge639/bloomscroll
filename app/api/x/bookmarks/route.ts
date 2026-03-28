// GET /api/x/bookmarks — Fetches the connected user's X bookmarks
// Reads access_token from httpOnly cookie, calls X API, returns
// bookmarks in BloomScroll format for client-side IndexedDB import.

import { NextRequest, NextResponse } from 'next/server'
import {
  fetchAllXBookmarks,
  getXUser,
  xBookmarkToBloomScroll,
  exchangeCodeForToken,
} from '@/lib/x-oauth'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  let accessToken = cookieStore.get('x_access_token')?.value
  const refreshToken = cookieStore.get('x_refresh_token')?.value

  if (!accessToken && refreshToken) {
    // Try to refresh the access token
    const clientId = process.env.X_CLIENT_ID
    const clientSecret = process.env.X_CLIENT_SECRET

    if (clientId && clientSecret) {
      try {
        const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
        const body = new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
        })

        const res = await fetch('https://api.twitter.com/2/oauth2/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
          body: body.toString(),
        })

        if (res.ok) {
          const data = await res.json() as { access_token: string; expires_in?: number; refresh_token?: string }
          accessToken = data.access_token

          const response = NextResponse.next()
          response.cookies.set('x_access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: data.expires_in ?? 7200,
          })
          if (data.refresh_token) {
            response.cookies.set('x_refresh_token', data.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 24 * 30,
            })
          }
        }
      } catch {
        // Refresh failed — return 401 to trigger reconnect
      }
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'not_connected' }, { status: 401 })
  }

  try {
    // Get user ID from stored cookie (set during callback)
    const userCookie = cookieStore.get('x_user')?.value
    let userId: string

    if (userCookie) {
      const userData = JSON.parse(userCookie) as { id: string }
      userId = userData.id
    } else {
      const user = await getXUser(accessToken)
      userId = user.id
    }

    const maxBookmarks = parseInt(request.nextUrl.searchParams.get('max') ?? '500', 10)
    const xBookmarks = await fetchAllXBookmarks(accessToken, userId, maxBookmarks)

    // Convert to BloomScroll format
    const bookmarks = xBookmarks.map(xBookmarkToBloomScroll)

    return NextResponse.json({
      bookmarks,
      count: bookmarks.length,
      userId,
    })
  } catch (err) {
    console.error('[X Bookmarks API]', err)
    const message = err instanceof Error ? err.message : 'Failed to fetch bookmarks'

    // If it looks like an auth error, return 401
    if (message.includes('401') || message.includes('403')) {
      return NextResponse.json({ error: 'token_expired' }, { status: 401 })
    }

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
