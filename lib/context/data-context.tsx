'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import { Bookmark, Tag, TagColor } from '@/types'
import * as bookmarkStorage from '@/lib/storage/bookmarks'
import * as tagStorage from '@/lib/storage/tags'
import { openDB } from '@/lib/db'
import { MOCK_BOOKMARKS, MOCK_TAGS } from '@/lib/mock-data'

export type SortOrder = 'newest' | 'oldest'
export type ReadFilter = 'all' | 'unread' | 'read'

interface DataContextValue {
  // Bookmarks
  bookmarks: Bookmark[]
  archivedBookmarks: Bookmark[]
  isLoading: boolean

  // Bookmark actions
  addBookmark: (
    data: Omit<Bookmark, 'id' | 'savedAt' | 'archived' | 'tags'>
  ) => Promise<Bookmark>
  archiveBookmark: (id: string) => Promise<void>
  unarchiveBookmark: (id: string) => Promise<void>
  deleteBookmark: (id: string) => Promise<void>
  addTagToBookmark: (bookmarkId: string, tagId: string) => Promise<void>
  removeTagFromBookmark: (bookmarkId: string, tagId: string) => Promise<void>
  markAsRead: (id: string) => Promise<void>
  markAsUnread: (id: string) => Promise<void>

  // Tags
  tags: Tag[]
  createTag: (name: string, color?: TagColor) => Promise<Tag>
  updateTag: (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => Promise<void>
  deleteTag: (id: string) => Promise<void>

  // Filters
  activeTagFilters: string[]
  setActiveTagFilters: (tagIds: string[]) => void
  filteredBookmarks: Bookmark[]
  readFilter: ReadFilter
  setReadFilter: (filter: ReadFilter) => void
  unreadCount: number

  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void

  // Sort
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void

  // Refresh
  refreshData: () => Promise<void>
}

const DataContext = createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [archivedBookmarks, setArchivedBookmarks] = useState<Bookmark[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTagFilters, setActiveTagFilters] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest')
  const [readFilter, setReadFilter] = useState<ReadFilter>('unread')
  
  // Load data from IndexedDB
  const refreshData = useCallback(async () => {
    try {
      const [loadedBookmarks, loadedArchived, loadedTags] = await Promise.all([
        bookmarkStorage.getBookmarks(false),
        bookmarkStorage.getArchivedBookmarks(),
        tagStorage.getTags(),
      ])
      
      setBookmarks(loadedBookmarks)
      setArchivedBookmarks(loadedArchived)
      setTags(loadedTags)
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }, [])
  
  // Initialize database and load data (auto-load demo data if empty)
  useEffect(() => {
    async function init() {
      try {
        await openDB()
        
        // Check if database is empty
        const existingBookmarks = await bookmarkStorage.getBookmarks(false)
        const existingTags = await tagStorage.getTags()
        
        // Auto-load demo data if database is empty
        if (existingBookmarks.length === 0 && existingTags.length === 0) {
          // Create demo tags first
          for (const tag of MOCK_TAGS) {
            await tagStorage.createTag(tag.name, tag.color)
          }
          
          // Then create demo bookmarks with proper IDs
          const createdTags = await tagStorage.getTags()
          const tagIdMap: Record<string, string> = {}
          MOCK_TAGS.forEach((mockTag, index) => {
            if (createdTags[index]) {
              tagIdMap[mockTag.id] = createdTags[index].id
            }
          })
          
          for (const bookmark of MOCK_BOOKMARKS) {
            const newBookmark = await bookmarkStorage.createBookmark({
              url: bookmark.url,
              text: bookmark.text,
              author: bookmark.author,
              timestamp: bookmark.timestamp,
              media: bookmark.media,
              linkPreview: bookmark.linkPreview,
              metrics: bookmark.metrics,
            })
            
            // Add mapped tags
            for (const oldTagId of bookmark.tags) {
              const newTagId = tagIdMap[oldTagId]
              if (newTagId) {
                await bookmarkStorage.addTagToBookmark(newBookmark.id, newTagId)
              }
            }
          }
        }
        
        await refreshData()
      } catch (error) {
        console.error('Failed to initialize database:', error)
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [refreshData])
  
  // Bookmark actions
  const addBookmark = useCallback(
    async (data: Omit<Bookmark, 'id' | 'savedAt' | 'archived' | 'tags'>) => {
      const bookmark = await bookmarkStorage.createBookmark(data)
      setBookmarks((prev) => [bookmark, ...prev])
      return bookmark
    },
    []
  )
  
  const archiveBookmark = useCallback(async (id: string) => {
    await bookmarkStorage.archiveBookmark(id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    const archived = await bookmarkStorage.getBookmarkById(id)
    if (archived) {
      setArchivedBookmarks((prev) => [archived, ...prev])
    }
  }, [])
  
  const unarchiveBookmark = useCallback(async (id: string) => {
    await bookmarkStorage.unarchiveBookmark(id)
    setArchivedBookmarks((prev) => prev.filter((b) => b.id !== id))
    const unarchived = await bookmarkStorage.getBookmarkById(id)
    if (unarchived) {
      setBookmarks((prev) => [unarchived, ...prev])
    }
  }, [])
  
  const deleteBookmark = useCallback(async (id: string) => {
    await bookmarkStorage.deleteBookmark(id)
    setBookmarks((prev) => prev.filter((b) => b.id !== id))
    setArchivedBookmarks((prev) => prev.filter((b) => b.id !== id))
  }, [])
  
  const addTagToBookmark = useCallback(async (bookmarkId: string, tagId: string) => {
    const updated = await bookmarkStorage.addTagToBookmark(bookmarkId, tagId)
    if (updated) {
      setBookmarks((prev) =>
        prev.map((b) => (b.id === bookmarkId ? updated : b))
      )
      setArchivedBookmarks((prev) =>
        prev.map((b) => (b.id === bookmarkId ? updated : b))
      )
    }
  }, [])
  
  const removeTagFromBookmark = useCallback(
    async (bookmarkId: string, tagId: string) => {
      const updated = await bookmarkStorage.removeTagFromBookmark(
        bookmarkId,
        tagId
      )
      if (updated) {
        setBookmarks((prev) =>
          prev.map((b) => (b.id === bookmarkId ? updated : b))
        )
        setArchivedBookmarks((prev) =>
          prev.map((b) => (b.id === bookmarkId ? updated : b))
        )
      }
    },
    []
  )
  
  const markAsRead = async (id: string) => {
    await bookmarkStorage.markBookmarkAsRead(id)
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, read: true } : b)))
  }

  const markAsUnread = async (id: string) => {
    await bookmarkStorage.markBookmarkAsUnread(id)
    setBookmarks((prev) => prev.map((b) => (b.id === id ? { ...b, read: false } : b)))
  }

  // Tag actions
  const createTag = useCallback(async (name: string, color?: TagColor) => {
    const tag = await tagStorage.createTag(name, color)
    setTags((prev) => [...prev, tag])
    return tag
  }, [])
  
  const updateTag = useCallback(
    async (id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>) => {
      const updated = await tagStorage.updateTag(id, updates)
      if (updated) {
        setTags((prev) => prev.map((t) => (t.id === id ? updated : t)))
      }
    },
    []
  )
  
  const deleteTag = useCallback(async (id: string) => {
    await tagStorage.deleteTag(id)
    setTags((prev) => prev.filter((t) => t.id !== id))
    // Remove tag from all bookmarks
    setBookmarks((prev) =>
      prev.map((b) => ({
        ...b,
        tags: b.tags.filter((t) => t !== id),
      }))
    )
    setArchivedBookmarks((prev) =>
      prev.map((b) => ({
        ...b,
        tags: b.tags.filter((t) => t !== id),
      }))
    )
  }, [])
  
  // Apply sort, tag filters, text search, and read filter
  const filteredBookmarks = (() => {
    const sorted = [...bookmarks].sort((a, b) =>
      sortOrder === 'newest' ? b.savedAt - a.savedAt : a.savedAt - b.savedAt
    )
    const tagFiltered =
      activeTagFilters.length > 0
        ? sorted.filter((b) => activeTagFilters.every((tagId) => b.tags.includes(tagId)))
        : sorted
    const searched = !searchQuery.trim()
      ? tagFiltered
      : tagFiltered.filter((b) => {
          const q = searchQuery.toLowerCase()
          return (
            b.text.toLowerCase().includes(q) ||
            b.author.name.toLowerCase().includes(q) ||
            b.author.handle.toLowerCase().includes(q) ||
            b.url.toLowerCase().includes(q)
          )
        })
    if (readFilter === 'unread') return searched.filter((b) => !b.read)
    if (readFilter === 'read') return searched.filter((b) => b.read)
    return searched
  })()

  const unreadCount = bookmarks.filter((b) => !b.read).length
  
  const value: DataContextValue = {
    bookmarks,
    archivedBookmarks,
    isLoading,
    addBookmark,
    archiveBookmark,
    unarchiveBookmark,
    deleteBookmark,
    addTagToBookmark,
    removeTagFromBookmark,
    markAsRead,
    markAsUnread,
    tags,
    createTag,
    updateTag,
    deleteTag,
    activeTagFilters,
    setActiveTagFilters,
    filteredBookmarks,
    readFilter,
    setReadFilter,
    unreadCount,
    searchQuery,
    setSearchQuery,
    sortOrder,
    setSortOrder,
    refreshData,
  }
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
