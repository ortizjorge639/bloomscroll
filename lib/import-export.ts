// Import/Export Utilities for BloomScroll

import { Bookmark, Tag, ImportResult } from '@/types'
import * as bookmarkStorage from '@/lib/storage/bookmarks'
import * as tagStorage from '@/lib/storage/tags'

// Parse X/Twitter bookmark export format
export function parseXBookmarks(
  data: unknown[]
): Array<Omit<Bookmark, 'id' | 'savedAt' | 'archived' | 'tags'>> {
  return data.map((item: unknown) => {
    const tweet = item as {
      tweet?: {
        full_text?: string
        created_at?: string
        user?: {
          name?: string
          screen_name?: string
          profile_image_url_https?: string
        }
        entities?: {
          urls?: Array<{ expanded_url?: string }>
          media?: Array<{
            type?: string
            media_url_https?: string
          }>
        }
        extended_entities?: {
          media?: Array<{
            type?: string
            media_url_https?: string
            video_info?: {
              variants?: Array<{ url?: string; content_type?: string }>
            }
          }>
        }
      }
      id_str?: string
    }

    const tweetData = tweet.tweet || tweet
    const user = tweetData.user || {}
    const entities = tweetData.entities || {}
    const extendedMedia = tweetData.extended_entities?.media || []

    // Build URL
    const tweetUrl = `https://x.com/${user.screen_name || 'unknown'}/status/${
      tweet.id_str || tweetData.id_str || ''
    }`

    // Parse media
    const media = extendedMedia.map((m) => {
      if (m.type === 'video' || m.type === 'animated_gif') {
        const videoVariant = m.video_info?.variants?.find(
          (v) => v.content_type === 'video/mp4'
        )
        return {
          type: m.type === 'animated_gif' ? 'gif' : 'video',
          url: videoVariant?.url || m.media_url_https || '',
        }
      }
      return {
        type: 'image' as const,
        url: m.media_url_https || '',
      }
    })

    return {
      url: tweetUrl,
      text: tweetData.full_text || '',
      author: {
        name: user.name || 'Unknown',
        handle: user.screen_name || 'unknown',
        avatar: user.profile_image_url_https,
      },
      timestamp: tweetData.created_at
        ? new Date(tweetData.created_at).getTime()
        : Date.now(),
      media: media.length > 0 ? media : undefined,
    }
  })
}

// Import bookmarks from JSON file
export async function importFromJSON(jsonContent: string): Promise<ImportResult> {
  try {
    const data = JSON.parse(jsonContent)
    
    // Handle different formats
    let bookmarksToImport: Array<Omit<Bookmark, 'id' | 'savedAt' | 'archived' | 'tags'>>
    
    if (Array.isArray(data)) {
      // Check if it's X/Twitter format
      if (data[0]?.tweet || data[0]?.full_text) {
        bookmarksToImport = parseXBookmarks(data)
      } else {
        // Assume it's our own format
        bookmarksToImport = data.map((b: Partial<Bookmark>) => ({
          url: b.url || '',
          text: b.text || '',
          author: b.author || { name: 'Unknown', handle: 'unknown' },
          timestamp: b.timestamp || Date.now(),
          media: b.media,
        }))
      }
    } else if (data.bookmarks && Array.isArray(data.bookmarks)) {
      const sample = data.bookmarks[0]

      // Third-party exporter format (content.text, metadata.timestamp, author.avatarUrl)
      if (sample?.content?.text !== undefined || sample?.metadata?.timestamp !== undefined) {
        bookmarksToImport = data.bookmarks.map((b: {
          url?: string
          author?: { name?: string; handle?: string; avatarUrl?: string }
          content?: { text?: string; media?: Array<{ type?: string; url?: string }> }
          metadata?: { timestamp?: string }
          bookmarkedAt?: string
        }) => {
          const media = (b.content?.media ?? [])
            .filter((m) => m.url)
            .map((m) => ({
              type: (m.type === 'video' ? 'video' : m.type === 'gif' ? 'gif' : 'image') as 'image' | 'video' | 'gif',
              url: m.url!,
            }))

          return {
            url: b.url || '',
            text: b.content?.text || '',
            author: {
              name: b.author?.name || 'Unknown',
              handle: b.author?.handle || 'unknown',
              avatar: b.author?.avatarUrl || undefined,
            },
            timestamp: b.metadata?.timestamp
              ? new Date(b.metadata.timestamp).getTime()
              : b.bookmarkedAt
              ? new Date(b.bookmarkedAt).getTime()
              : Date.now(),
            media: media.length > 0 ? media : undefined,
          }
        })
      } else {
        // BloomScroll native export format
        bookmarksToImport = data.bookmarks.map((b: Partial<Bookmark>) => ({
          url: b.url || '',
          text: b.text || '',
          author: b.author || { name: 'Unknown', handle: 'unknown' },
          timestamp: b.timestamp || Date.now(),
          media: b.media,
        }))

        // Import tags if present
        if (data.tags && Array.isArray(data.tags)) {
          await tagStorage.importTags(data.tags)
        }
      }
    } else {
      throw new Error('Unrecognized format')
    }
    
    const result = await bookmarkStorage.importBookmarks(bookmarksToImport)
    
    return {
      success: true,
      imported: result.imported,
      duplicates: result.duplicates,
      errors: [],
    }
  } catch (error) {
    return {
      success: false,
      imported: 0,
      duplicates: 0,
      errors: [error instanceof Error ? error.message : 'Failed to parse JSON'],
    }
  }
}

// Export all data to JSON
export async function exportToJSON(): Promise<string> {
  const [bookmarks, tags] = await Promise.all([
    bookmarkStorage.exportBookmarks(),
    tagStorage.exportTags(),
  ])
  
  return JSON.stringify(
    {
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks,
      tags,
    },
    null,
    2
  )
}

// Download JSON file
export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Parse URLs from text (for manual entry)
export function parseURLsFromText(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g
  const matches = text.match(urlRegex)
  return matches ? [...new Set(matches)] : []
}
