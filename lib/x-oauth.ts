// X (Twitter) OAuth 2.0 PKCE utilities for BloomScroll
// Uses X API v2 with user-context OAuth 2.0

export const X_AUTH_URL = 'https://twitter.com/i/oauth2/authorize'
export const X_TOKEN_URL = 'https://api.twitter.com/2/oauth2/token'
export const X_USER_URL = 'https://api.twitter.com/2/users/me'
export const X_BOOKMARKS_URL = 'https://api.twitter.com/2/users'

export const X_SCOPES = 'bookmark.read tweet.read users.read offline.access'

// ─── PKCE helpers ────────────────────────────────────────────────────────────

/** Generate a cryptographically random code verifier (43–128 chars, URL-safe) */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return base64urlEncode(array)
}

/** Generate a random state string for CSRF protection */
export function generateState(): string {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return base64urlEncode(array)
}

/** Compute SHA-256 code challenge from verifier */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64urlEncode(new Uint8Array(digest))
}

function base64urlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// ─── Authorization URL ────────────────────────────────────────────────────────

export function buildAuthorizationUrl(params: {
  clientId: string
  redirectUri: string
  state: string
  codeChallenge: string
}): string {
  const url = new URL(X_AUTH_URL)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('scope', X_SCOPES)
  url.searchParams.set('state', params.state)
  url.searchParams.set('code_challenge', params.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  return url.toString()
}

// ─── Token exchange ───────────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in?: number
  token_type: string
  scope: string
}

export async function exchangeCodeForToken(params: {
  code: string
  codeVerifier: string
  redirectUri: string
  clientId: string
  clientSecret: string
}): Promise<TokenResponse> {
  const credentials = Buffer.from(`${params.clientId}:${params.clientSecret}`).toString('base64')

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    code_verifier: params.codeVerifier,
    client_id: params.clientId,
  })

  const res = await fetch(X_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: body.toString(),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Token exchange failed: ${res.status} ${error}`)
  }

  return res.json() as Promise<TokenResponse>
}

// ─── User info ────────────────────────────────────────────────────────────────

export interface XUser {
  id: string
  name: string
  username: string
  profile_image_url?: string
}

export async function getXUser(accessToken: string): Promise<XUser> {
  const res = await fetch(`${X_USER_URL}?user.fields=name,username,profile_image_url`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to get user: ${res.status} ${error}`)
  }

  const json = await res.json() as { data: XUser }
  return json.data
}

// ─── Bookmarks fetch ──────────────────────────────────────────────────────────

export interface XBookmark {
  id: string
  text: string
  created_at?: string
  author_id?: string
  author?: {
    id: string
    name: string
    username: string
    profile_image_url?: string
  }
  media?: Array<{
    type: 'photo' | 'video' | 'animated_gif'
    url?: string
    preview_image_url?: string
    variants?: Array<{ url: string; content_type: string; bit_rate?: number }>
  }>
  entities?: {
    urls?: Array<{ expanded_url: string; display_url: string }>
  }
}

export interface BookmarksPage {
  bookmarks: XBookmark[]
  nextToken?: string
}

export async function fetchXBookmarksPage(
  accessToken: string,
  userId: string,
  paginationToken?: string
): Promise<BookmarksPage> {
  const url = new URL(`${X_BOOKMARKS_URL}/${userId}/bookmarks`)
  url.searchParams.set('max_results', '100')
  url.searchParams.set('expansions', 'author_id,attachments.media_keys')
  url.searchParams.set('tweet.fields', 'created_at,text,author_id,entities,attachments')
  url.searchParams.set('user.fields', 'name,username,profile_image_url')
  url.searchParams.set('media.fields', 'url,preview_image_url,type,variants')
  if (paginationToken) {
    url.searchParams.set('pagination_token', paginationToken)
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Failed to fetch bookmarks: ${res.status} ${error}`)
  }

  const json = await res.json() as {
    data?: Array<{
      id: string
      text: string
      created_at?: string
      author_id?: string
      attachments?: { media_keys?: string[] }
      entities?: { urls?: Array<{ expanded_url: string; display_url: string }> }
    }>
    includes?: {
      users?: Array<{ id: string; name: string; username: string; profile_image_url?: string }>
      media?: Array<{
        media_key: string
        type: 'photo' | 'video' | 'animated_gif'
        url?: string
        preview_image_url?: string
        variants?: Array<{ url: string; content_type: string; bit_rate?: number }>
      }>
    }
    meta?: { next_token?: string; result_count?: number }
  }

  const users = json.includes?.users ?? []
  const mediaMap = new Map(
    (json.includes?.media ?? []).map((m) => [m.media_key, m])
  )

  const bookmarks: XBookmark[] = (json.data ?? []).map((tweet) => {
    const author = users.find((u) => u.id === tweet.author_id)
    const mediaKeys = tweet.attachments?.media_keys ?? []
    const media = mediaKeys
      .map((key) => mediaMap.get(key))
      .filter(Boolean)
      .map((m) => ({
        type: m!.type,
        url: m!.url ?? m!.preview_image_url,
        preview_image_url: m!.preview_image_url,
        variants: m!.variants,
      }))

    return {
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      author_id: tweet.author_id,
      author: author
        ? {
            id: author.id,
            name: author.name,
            username: author.username,
            profile_image_url: author.profile_image_url,
          }
        : undefined,
      media: media.length > 0 ? media : undefined,
      entities: tweet.entities,
    }
  })

  return {
    bookmarks,
    nextToken: json.meta?.next_token,
  }
}

/** Fetch ALL bookmarks, paginating through all pages (max 500 by default) */
export async function fetchAllXBookmarks(
  accessToken: string,
  userId: string,
  maxBookmarks = 500
): Promise<XBookmark[]> {
  const allBookmarks: XBookmark[] = []
  let nextToken: string | undefined

  do {
    const page = await fetchXBookmarksPage(accessToken, userId, nextToken)
    allBookmarks.push(...page.bookmarks)
    nextToken = page.nextToken

    if (allBookmarks.length >= maxBookmarks) break
  } while (nextToken)

  return allBookmarks.slice(0, maxBookmarks)
}

// ─── Convert X bookmarks to BloomScroll format ──────────────────────────────

import type { Bookmark } from '@/types'

export function xBookmarkToBloomScroll(
  xBookmark: XBookmark
): Omit<Bookmark, 'id' | 'savedAt' | 'archived' | 'tags'> {
  const tweetUrl = `https://x.com/${xBookmark.author?.username ?? 'unknown'}/status/${xBookmark.id}`

  const media = (xBookmark.media ?? []).map((m) => {
    if (m.type === 'video' || m.type === 'animated_gif') {
      // Pick best quality video variant
      const variants = m.variants ?? []
      const mp4 = variants
        .filter((v) => v.content_type === 'video/mp4')
        .sort((a, b) => (b.bit_rate ?? 0) - (a.bit_rate ?? 0))
      return {
        type: (m.type === 'animated_gif' ? 'gif' : 'video') as 'gif' | 'video',
        url: mp4[0]?.url ?? m.url ?? '',
      }
    }
    return {
      type: 'image' as const,
      url: m.url ?? '',
    }
  })

  return {
    url: tweetUrl,
    text: xBookmark.text,
    author: {
      name: xBookmark.author?.name ?? 'Unknown',
      handle: xBookmark.author?.username ?? 'unknown',
      avatar: xBookmark.author?.profile_image_url,
    },
    timestamp: xBookmark.created_at ? new Date(xBookmark.created_at).getTime() : Date.now(),
    media: media.length > 0 ? media : undefined,
  }
}
