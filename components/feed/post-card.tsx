'use client'

import { useState } from 'react'
import { Bookmark, TagColor } from '@/types'
import { useData } from '@/lib/context/data-context'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  Archive,
  ArchiveRestore,
  ExternalLink,
  MoreHorizontal,
  Tag as TagIcon,
  Trash2,
  X,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

const tagColorClasses: Record<TagColor, string> = {
  blue: 'bg-tag-blue/20 text-tag-blue',
  green: 'bg-tag-green/20 text-tag-green',
  yellow: 'bg-tag-yellow/20 text-tag-yellow',
  red: 'bg-tag-red/20 text-tag-red',
  purple: 'bg-tag-purple/20 text-tag-purple',
  cyan: 'bg-tag-cyan/20 text-tag-cyan',
  orange: 'bg-tag-orange/20 text-tag-orange',
  pink: 'bg-tag-pink/20 text-tag-pink',
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

interface PostCardProps {
  bookmark: Bookmark
  variant?: 'feed' | 'compact' | 'list'
  showUnarchive?: boolean
  onOpenBrowser?: (url: string) => void
}

export function PostCard({
  bookmark,
  variant = 'feed',
  showUnarchive = false,
  onOpenBrowser,
}: PostCardProps) {
  const {
    tags,
    archiveBookmark,
    unarchiveBookmark,
    deleteBookmark,
    addTagToBookmark,
    removeTagFromBookmark,
  } = useData()
  const [isTagging, setIsTagging] = useState(false)

  const bookmarkTags = tags.filter((t) => bookmark.tags.includes(t.id))
  const availableTags = tags.filter((t) => !bookmark.tags.includes(t.id))

  const handleArchive = async () => {
    try {
      await archiveBookmark(bookmark.id)
      toast.success('Bookmark archived')
    } catch {
      toast.error('Failed to archive')
    }
  }

  const handleUnarchive = async () => {
    try {
      await unarchiveBookmark(bookmark.id)
      toast.success('Bookmark restored')
    } catch {
      toast.error('Failed to restore')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteBookmark(bookmark.id)
      toast.success('Bookmark deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleAddTag = async (tagId: string) => {
    await addTagToBookmark(bookmark.id, tagId)
  }

  const handleRemoveTag = async (tagId: string) => {
    await removeTagFromBookmark(bookmark.id, tagId)
  }

  const handleOpenExternal = () => {
    if (onOpenBrowser) {
      onOpenBrowser(bookmark.url)
    } else {
      window.open(bookmark.url, '_blank', 'noopener,noreferrer')
    }
  }

  const timeAgo = formatDistanceToNow(new Date(bookmark.savedAt), {
    addSuffix: true,
  })

  if (variant === 'feed') {
    return (
      <article className="flex h-full w-full flex-col bg-card snap-card">
        <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 md:px-12 lg:px-20">
          {/* Content */}
          <div className="flex w-full max-w-2xl flex-col gap-4 sm:gap-6">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                {bookmark.author.avatar ? (
                  <img
                    src={bookmark.author.avatar}
                    alt={bookmark.author.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {bookmark.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {bookmark.author.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  @{bookmark.author.handle} · {timeAgo}
                </span>
              </div>
            </div>

            {/* Text content */}
            <p className="text-base leading-relaxed text-foreground sm:text-lg md:text-xl lg:text-2xl">
              {bookmark.text}
            </p>

            {/* Media */}
            {bookmark.media && bookmark.media.length > 0 && (
              <div className="overflow-hidden rounded-xl">
                {bookmark.media[0].type === 'image' && (
                  <img
                    src={bookmark.media[0].url}
                    alt={bookmark.media[0].alt || 'Post image'}
                    className="max-h-80 w-full object-cover"
                  />
                )}
              </div>
            )}

            {/* Tags */}
            {bookmarkTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {bookmarkTags.map((tag) => (
                  <span
                    key={tag.id}
                    className={cn(
                      'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
                      tagColorClasses[tag.color]
                    )}
                  >
                    <span
                      className={cn('h-1.5 w-1.5 rounded-full', tagDotClasses[tag.color])}
                    />
                    {tag.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-1 border-t border-border px-3 py-3 sm:gap-2 sm:px-6 sm:py-4">
          <Popover open={isTagging} onOpenChange={setIsTagging}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <TagIcon className="h-4 w-4" />
                Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="center">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  Tags
                </span>
                {/* Current tags */}
                {bookmarkTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {bookmarkTags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => handleRemoveTag(tag.id)}
                        className={cn(
                          'flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-opacity hover:opacity-70',
                          tagColorClasses[tag.color]
                        )}
                      >
                        {tag.name}
                        <X className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                )}
                {/* Available tags */}
                {availableTags.length > 0 && (
                  <>
                    <span className="mt-2 text-xs text-muted-foreground">
                      Add tag
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {availableTags.map((tag) => (
                        <button
                          key={tag.id}
                          onClick={() => handleAddTag(tag.id)}
                          className="flex items-center gap-1 rounded-full border border-border bg-secondary px-2 py-0.5 text-xs text-secondary-foreground transition-colors hover:bg-accent"
                        >
                          <span
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              tagDotClasses[tag.color]
                            )}
                          />
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {showUnarchive ? (
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleUnarchive}>
              <ArchiveRestore className="h-4 w-4" />
              Restore
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="gap-2" onClick={handleArchive}>
              <Archive className="h-4 w-4" />
              Archive
            </Button>
          )}

          <Button variant="ghost" size="sm" className="gap-2" onClick={handleOpenExternal}>
            <ExternalLink className="h-4 w-4" />
            Open
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={handleOpenExternal}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in new tab
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </article>
    )
  }

  // Compact variant (grid)
  if (variant === 'compact') {
    return (
      <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-muted-foreground/30">
        {/* Media */}
        {bookmark.media && bookmark.media.length > 0 && (
          <div className="aspect-video overflow-hidden">
            <img
              src={bookmark.media[0].url}
              alt={bookmark.media[0].alt || 'Post image'}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
              {bookmark.author.name.charAt(0).toUpperCase()}
            </div>
            <span className="truncate text-xs text-muted-foreground">
              @{bookmark.author.handle}
            </span>
          </div>

          {/* Text */}
          <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-foreground">
            {bookmark.text}
          </p>

          {/* Tags */}
          {bookmarkTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmarkTags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs',
                    tagColorClasses[tag.color]
                  )}
                >
                  {tag.name}
                </span>
              ))}
              {bookmarkTags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{bookmarkTags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            <div className="flex gap-1">
              {showUnarchive ? (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleUnarchive}>
                  <ArchiveRestore className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleArchive}>
                  <Archive className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleOpenExternal}>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </article>
    )
  }

  // List variant
  return (
    <article className="flex items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/50">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {bookmark.author.avatar ? (
          <img
            src={bookmark.author.avatar}
            alt={bookmark.author.name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium">
            {bookmark.author.name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">
            {bookmark.author.name}
          </span>
          <span className="text-sm text-muted-foreground">
            @{bookmark.author.handle}
          </span>
          <span className="text-sm text-muted-foreground">·</span>
          <span className="text-sm text-muted-foreground">{timeAgo}</span>
        </div>

        <p className="text-sm leading-relaxed text-foreground">{bookmark.text}</p>

        {/* Tags */}
        {bookmarkTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {bookmarkTags.map((tag) => (
              <span
                key={tag.id}
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs',
                  tagColorClasses[tag.color]
                )}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-1">
        {showUnarchive ? (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleUnarchive}>
            <ArchiveRestore className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleArchive}>
            <Archive className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenExternal}>
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </article>
  )
}
