// GET /api/auth/x — Initiates X OAuth 2.0 PKCE flow
// Generates state + code_verifier, stores them in cookies, redirects to X

import { NextResponse } from 'next/server'
import {
  generateCodeVerifier,
  generateState,
  generateCodeChallenge,
  buildAuthorizationUrl,
} from '@/lib/x-oauth'

export async function GET() {
  const clientId = process.env.X_CLIENT_ID
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

  if (!clientId) {
    return NextResponse.json(
      { error: 'X OAuth is not configured. Add X_CLIENT_ID to your environment variables.' },
      { status: 503 }
    )
  }

  const redirectUri = `${appUrl}/api/auth/x/callback`
  const state = generateState()
  const codeVerifier = generateCodeVerifier()
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  const authUrl = buildAuthorizationUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge,
  })

  // Store state + verifier in short-lived httpOnly cookies (10 min)
  const response = NextResponse.redirect(authUrl)

  response.cookies.set('x_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes
  })

  response.cookies.set('x_oauth_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })

  return response
}
