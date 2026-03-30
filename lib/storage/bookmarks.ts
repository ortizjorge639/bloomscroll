// Bookmark Storage Operations

import { Bookmark, STORES } from '@/types'
import {
  getAllSortedByIndex,
  getByKey,
  getByIndex,
  putItem,
  deleteItem,
  getAllFromStore,
} from '@/lib/db'

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Get all bookmarks sorted by savedAt (newest first)
export async function getBookmarks(includeArchived = false): Promise<Bookmark[]> {
  const allBookmarks = await getAllSortedByIndex<Bookmark>(
    STORES.BOOKMARKS,
    'savedAt',
    'prev'
  )
  
  if (includeArchived) {
    return allBookmarks
  }
  
  return allBookmarks.filter((b) => !b.archived)
}

// Get archived bookmarks
export async function getArchivedBookmarks(): Promise<Bookmark[]> {
  const all = await getAllSortedByIndex<Bookmark>(
    STORES.BOOKMARKS,
    'savedAt',
    'prev'
  )
  return all.filter((b) => b.archived)
}

// Get bookmark by ID
export async function getBookmarkById(id: string): Promise<Bookmark | undefined> {
  return getByKey<Bookmark>(STORES.BOOKMARKS, id)
}

// Get bookmarks by tag
export async function getBookmarksByTag(tagId: string): Promise<Bookmark[]> {
  const all = await getBookmarks()
  return all.filter((b) => b.tags.includes(tagId))
}

// Create new bookmark
export async function createBookmark(
  data: Omit<Bookmark, 'id' | 'savedAt' | 'archived' | 'tags'>
): Promise<Bookmark> {
  const bookmark: Bookmark = {
    ...data,
    id: generateId(),
    savedAt: Date.now(),
    archived: false,
    tags: [],
  }
  
  await putItem(STORES.BOOKMARKS, bookmark)
  return bookmark
}

// Update bookmark
export async function updateBookmark(
  id: string,
  updates: Partial<Omit<Bookmark, 'id'>>
): Promise<Bookmark | null> {
  const existing = await getBookmarkById(id)
  if (!existing) return null
  
  const updated = { ...existing, ...updates }
  await putItem(STORES.BOOKMARKS, updated)
  return updated
}

// Archive bookmark
export async function archiveBookmark(id: string): Promise<boolean> {
  const result = await updateBookmark(id, { archived: true })
  return result !== null
}

// Unarchive bookmark
export async function unarchiveBookmark(id: string): Promise<boolean> {
  const result = await updateBookmark(id, { archived: false })
  return result !== null
}

// Delete bookmark permanently
export async function deleteBookmark(id: string): Promise<void> {
  await deleteItem(STORES.BOOKMARKS, id)
}

// Add tag to bookmark
export async function addTagToBookmark(
  bookmarkId: string,
  tagId: string
): Promise<Bookmark | null> {
  const bookmark = await getBookmarkById(bookmarkId)
  if (!bookmark) return null
  
  if (!bookmark.tags.includes(tagId)) {
    bookmark.tags.push(tagId)
    await putItem(STORES.BOOKMARKS, bookmark)
  }
  
  return bookmark
}

// Remove tag from bookmark
export async function removeTagFromBookmark(
  bookmarkId: string,
  tagId: string
): Promise<Bookmark | null> {
  const bookmark = await getBookmarkById(bookmarkId)
  if (!bookmark) return null
  
  bookmark.tags = bookmark.tags.filter((t) => t !== tagId)
  await putItem(STORES.BOOKMARKS, bookmark)
  
  return bookmark
}

// Import multiple bookmarks
export async function importBookmarks(
  bookmarks: Array<Omit<Bookmark, 'id' | 'archived' | 'tags'>>
): Promise<{ imported: number; duplicates: number }> {
  const existing = await getAllFromStore<Bookmark>(STORES.BOOKMARKS)
  const existingUrls = new Set(existing.map((b) => b.url))

  let imported = 0
  let duplicates = 0

  for (const data of bookmarks) {
    if (existingUrls.has(data.url)) {
      duplicates++
      continue
    }

    const bookmark: Bookmark = {
      ...data,
      id: generateId(),
      savedAt: data.savedAt ?? Date.now(),
      archived: false,
      tags: [],
    }

    await putItem(STORES.BOOKMARKS, bookmark)
    imported++
  }

  return { imported, duplicates }
}

// Export all bookmarks
export async function exportBookmarks(): Promise<Bookmark[]> {
  return getAllFromStore<Bookmark>(STORES.BOOKMARKS)
}

// Get bookmark count
export async function getBookmarkCount(): Promise<{
  total: number
  active: number
  archived: number
}> {
  const all = await getAllFromStore<Bookmark>(STORES.BOOKMARKS)
  const archived = all.filter((b) => b.archived).length
  
  return {
    total: all.length,
    active: all.length - archived,
    archived,
  }
}
