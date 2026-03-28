// GET /api/auth/x/callback — Handles X OAuth 2.0 callback
// Exchanges code for access_token, stores token in httpOnly cookie,
// then redirects user back to /settings

import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getXUser } from '@/lib/x-oauth'

export async function GET(request: NextRequest) {
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const settingsUrl = `${appUrl}/settings`

  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // User denied access
  if (error) {
    return NextResponse.redirect(`${settingsUrl}?x_error=${encodeURIComponent(error)}`)
  }

  // Validate state (CSRF protection)
  const storedState = request.cookies.get('x_oauth_state')?.value
  const codeVerifier = request.cookies.get('x_oauth_verifier')?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(`${settingsUrl}?x_error=invalid_state`)
  }

  if (!code || !codeVerifier) {
    return NextResponse.redirect(`${settingsUrl}?x_error=missing_params`)
  }

  const clientId = process.env.X_CLIENT_ID
  const clientSecret = process.env.X_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${settingsUrl}?x_error=not_configured`)
  }

  try {
    const redirectUri = `${appUrl}/api/auth/x/callback`

    // Exchange authorization code for access token
    const tokenData = await exchangeCodeForToken({
      code,
      codeVerifier,
      redirectUri,
      clientId,
      clientSecret,
    })

    // Get the user's X ID so we can fetch their bookmarks
    const user = await getXUser(tokenData.access_token)

    // Store tokens + user info in httpOnly cookies
    const response = NextResponse.redirect(`${settingsUrl}?x_connected=true`)

    // Clear PKCE cookies
    response.cookies.delete('x_oauth_state')
    response.cookies.delete('x_oauth_verifier')

    // Access token (expires per X's schedule, default 2 hours)
    response.cookies.set('x_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: tokenData.expires_in ?? 7200,
    })

    // Refresh token (longer-lived, for offline.access scope)
    if (tokenData.refresh_token) {
      response.cookies.set('x_refresh_token', tokenData.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    // User ID + info (not sensitive, used client-side to show connected state)
    response.cookies.set(
      'x_user',
      JSON.stringify({ id: user.id, name: user.name, username: user.username, avatar: user.profile_image_url }),
      {
        httpOnly: false, // Readable by JS for UI
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
      }
    )

    return response
  } catch (err) {
    console.error('[X OAuth Callback]', err)
    const msg = err instanceof Error ? err.message : 'unknown_error'
    return NextResponse.redirect(`${settingsUrl}?x_error=${encodeURIComponent(msg)}`)
  }
}
