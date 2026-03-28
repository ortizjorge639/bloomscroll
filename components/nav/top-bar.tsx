'use client'

import { useData } from '@/lib/context/data-context'
import { cn } from '@/lib/utils'
import { X, Plus, Tag as TagIcon } from 'lucide-react'
import { useState } from 'react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TAG_COLORS, TagColor } from '@/types'

const tagColorClasses: Record<TagColor, string> = {
  blue: 'bg-tag-blue/20 text-tag-blue border-tag-blue/30 hover:bg-tag-blue/30',
  green: 'bg-tag-green/20 text-tag-green border-tag-green/30 hover:bg-tag-green/30',
  yellow: 'bg-tag-yellow/20 text-tag-yellow border-tag-yellow/30 hover:bg-tag-yellow/30',
  red: 'bg-tag-red/20 text-tag-red border-tag-red/30 hover:bg-tag-red/30',
  purple: 'bg-tag-purple/20 text-tag-purple border-tag-purple/30 hover:bg-tag-purple/30',
  cyan: 'bg-tag-cyan/20 text-tag-cyan border-tag-cyan/30 hover:bg-tag-cyan/30',
  orange: 'bg-tag-orange/20 text-tag-orange border-tag-orange/30 hover:bg-tag-orange/30',
  pink: 'bg-tag-pink/20 text-tag-pink border-tag-pink/30 hover:bg-tag-pink/30',
}

const tagDotClasses: Record<TagColor, string> = {
  blue: 'bg-tag-blue',
  green: 'bg-tag-green',
  yellow: 'bg-tag-yellow',
  red: 'bg-tag-red',
  purple: 'bg-tag-purple',
  cyan: 'bg-tag-cyan',
  orange: 'bg-tag-orange',
  pink: 'bg-tag-pink',
}

interface TopBarProps {
  title?: string
  showFilters?: boolean
  showCount?: boolean
}

export function TopBar({
  title,
  showFilters = true,
  showCount = true,
}: TopBarProps) {
  const { tags, activeTagFilters, setActiveTagFilters, filteredBookmarks, createTag } =
    useData()
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState<TagColor>('blue')

  const toggleTag = (tagId: string) => {
    if (activeTagFilters.includes(tagId)) {
      setActiveTagFilters(activeTagFilters.filter((id) => id !== tagId))
    } else {
      setActiveTagFilters([...activeTagFilters, tagId])
    }
  }

  const clearFilters = () => {
    setActiveTagFilters([])
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      await createTag(newTagName.trim(), newTagColor)
      setNewTagName('')
      setIsCreating(false)
    } catch (error) {
      console.error('Failed to create tag:', error)
    }
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 md:gap-4 md:px-4">
      {/* Title and count */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        {title && (
          <h1 className="text-base font-semibold text-foreground md:text-lg">{title}</h1>
        )}
        {showCount && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {filteredBookmarks.length}
          </span>
        )}
      </div>

      {/* Tag filters */}
      {showFilters && (
        <div className="flex flex-1 items-center gap-1.5 overflow-x-auto px-1 hide-scrollbar md:gap-2 md:px-2">
          {/* Active filter indicator */}
          {activeTagFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary transition-colors hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}

          {/* Tag pills */}
          {tags.map((tag) => {
            const isActive = activeTagFilters.includes(tag.id)
            return (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                  isActive
                    ? tagColorClasses[tag.color]
                    : 'border-border bg-secondary text-secondary-foreground hover:bg-accent'
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    tagDotClasses[tag.color]
                  )}
                />
                {tag.name}
              </button>
            )
          })}

          {/* Add tag button */}
          <Popover open={isCreating} onOpenChange={setIsCreating}>
            <PopoverTrigger asChild>
              <button className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground">
                <Plus className="h-3 w-3" />
                Tag
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64" align="start">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <TagIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">New Tag</span>
                </div>
                <Input
                  placeholder="Tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateTag()
                  }}
                />
                <div className="flex flex-wrap gap-1.5">
                  {TAG_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewTagColor(color)}
                      className={cn(
                        'h-6 w-6 rounded-full transition-all',
                        tagDotClasses[color],
                        newTagColor === color
                          ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background'
                          : 'opacity-60 hover:opacity-100'
                      )}
                      aria-label={`Select ${color} color`}
                    />
                  ))}
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                >
                  Create Tag
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </header>
  )
}
