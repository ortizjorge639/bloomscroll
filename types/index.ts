// BloomScroll Data Types

export interface Bookmark {
  id: string
  url: string
  text: string
  author: {
    name: string
    handle: string
    avatar?: string
  }
  timestamp: number
  savedAt: number
  media?: BookmarkMedia[]
  metrics?: {
    likes?: number
    retweets?: number
    replies?: number
  }
  archived: boolean
  tags: string[]
}

export interface BookmarkMedia {
  type: 'image' | 'video' | 'gif'
  url: string
  alt?: string
  width?: number
  height?: number
}

export interface Tag {
  id: string
  name: string
  color: TagColor
  createdAt: number
}

export type TagColor = 
  | 'blue'
  | 'green'
  | 'yellow'
  | 'red'
  | 'purple'
  | 'cyan'
  | 'orange'
  | 'pink'

export const TAG_COLORS: TagColor[] = [
  'blue',
  'green',
  'yellow',
  'red',
  'purple',
  'cyan',
  'orange',
  'pink',
]

export interface AppSettings {
  viewMode: 'feed' | 'grid' | 'list'
  sortOrder: 'newest' | 'oldest'
  showArchived: boolean
}

export interface ImportResult {
  success: boolean
  imported: number
  duplicates: number
  errors: string[]
}

// Database store names
export const DB_NAME = 'bloomscroll-db'
export const DB_VERSION = 1

export const STORES = {
  BOOKMARKS: 'bookmarks',
  TAGS: 'tags',
  SETTINGS: 'settings',
} as const
