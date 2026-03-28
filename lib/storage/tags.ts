// Tag Storage Operations

import { Tag, TagColor, STORES } from '@/types'
import {
  getAllFromStore,
  getByKey,
  putItem,
  deleteItem,
} from '@/lib/db'

// Generate unique ID
function generateId(): string {
  return `tag-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

// Get all tags
export async function getTags(): Promise<Tag[]> {
  return getAllFromStore<Tag>(STORES.TAGS)
}

// Get tag by ID
export async function getTagById(id: string): Promise<Tag | undefined> {
  return getByKey<Tag>(STORES.TAGS, id)
}

// Get tag by name
export async function getTagByName(name: string): Promise<Tag | undefined> {
  const tags = await getTags()
  return tags.find((t) => t.name.toLowerCase() === name.toLowerCase())
}

// Create new tag
export async function createTag(
  name: string,
  color: TagColor = 'blue'
): Promise<Tag> {
  const existing = await getTagByName(name)
  if (existing) {
    throw new Error(`Tag "${name}" already exists`)
  }
  
  const tag: Tag = {
    id: generateId(),
    name: name.trim(),
    color,
    createdAt: Date.now(),
  }
  
  await putItem(STORES.TAGS, tag)
  return tag
}

// Update tag
export async function updateTag(
  id: string,
  updates: Partial<Omit<Tag, 'id' | 'createdAt'>>
): Promise<Tag | null> {
  const existing = await getTagById(id)
  if (!existing) return null
  
  // Check for name conflicts
  if (updates.name) {
    const nameConflict = await getTagByName(updates.name)
    if (nameConflict && nameConflict.id !== id) {
      throw new Error(`Tag "${updates.name}" already exists`)
    }
  }
  
  const updated = { ...existing, ...updates }
  await putItem(STORES.TAGS, updated)
  return updated
}

// Delete tag
export async function deleteTag(id: string): Promise<void> {
  await deleteItem(STORES.TAGS, id)
}

// Import tags
export async function importTags(
  tags: Array<{ name: string; color: TagColor }>
): Promise<{ imported: number; skipped: number }> {
  const existing = await getTags()
  const existingNames = new Set(existing.map((t) => t.name.toLowerCase()))
  
  let imported = 0
  let skipped = 0
  
  for (const tag of tags) {
    if (existingNames.has(tag.name.toLowerCase())) {
      skipped++
      continue
    }
    
    await createTag(tag.name, tag.color)
    imported++
  }
  
  return { imported, skipped }
}

// Export all tags
export async function exportTags(): Promise<Tag[]> {
  return getTags()
}

// Get or create tag by name
export async function getOrCreateTag(
  name: string,
  color: TagColor = 'blue'
): Promise<Tag> {
  const existing = await getTagByName(name)
  if (existing) return existing
  
  return createTag(name, color)
}
