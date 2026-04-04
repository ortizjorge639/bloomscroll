'use client'

import { useState } from 'react'
import { Bookmark, BookmarkMedia, TagColor } from '@/types'
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
  Play,
  Images,
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
import { MediaViewer } from '@/components/media-viewer'
import { RichText } from '@/components/rich-text'

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
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const media = bookmark.media?.filter((m) => m.url) ?? []
  const openViewer = (index: number) => setViewerIndex(index)
  const closeViewer = () => setViewerIndex(null)

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
    window.open(bookmark.url, '_blank', 'noopener,noreferrer')
  }

  const timeAgo = formatDistanceToNow(new Date(bookmark.savedAt), {
    addSuffix: true,
  })

  if (variant === 'feed') {
    return (
      <>
      <article className="flex h-full w-full flex-col bg-card snap-card">
        <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-[10vh] sm:px-6 md:px-12 lg:px-20">
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
              <RichText text={bookmark.text} />
            </p>

            {/* Media */}
            {media.length > 0 && (
              <MediaGrid items={media} onOpen={openViewer} />
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

      {/* Fullscreen media viewer */}
      {viewerIndex !== null && media.length > 0 && (
        <MediaViewer items={media} initialIndex={viewerIndex} onClose={closeViewer} />
      )}
    </>
  )
  }

  // Compact variant (grid)
  if (variant === 'compact') {
    return (
      <>
      <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-muted-foreground/30">
        {/* Media */}
        {media.length > 0 && (
          <div className="aspect-video overflow-hidden bg-muted">
            <MediaThumb item={media[0]} count={media.length} onOpen={() => openViewer(0)} compact />
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
            <RichText text={bookmark.text} />
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

      {viewerIndex !== null && media.length > 0 && (
        <MediaViewer items={media} initialIndex={viewerIndex} onClose={closeViewer} />
      )}
    </>
    )
  }

  // List variant
  return (
    <>
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

        <p className="text-sm leading-relaxed text-foreground"><RichText text={bookmark.text} /></p>

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

    {viewerIndex !== null && media.length > 0 && (
      <MediaViewer items={media} initialIndex={viewerIndex} onClose={closeViewer} />
    )}
  </>
  )
}

// ─── Media helpers ────────────────────────────────────────────────────────────

function MediaGrid({
  items,
  onOpen,
}: {
  items: BookmarkMedia[]
  onOpen: (index: number) => void
}) {
  if (items.length === 1) {
    return (
      <div className="overflow-hidden rounded-xl">
        <MediaThumb item={items[0]} count={1} onOpen={() => onOpen(0)} />
      </div>
    )
  }

  // 2-4 items: grid layout
  return (
    <div
      className={cn(
        'grid gap-1 overflow-hidden rounded-xl',
        items.length === 2 && 'grid-cols-2',
        items.length === 3 && 'grid-cols-2',
        items.length >= 4 && 'grid-cols-2'
      )}
    >
      {items.slice(0, 4).map((item, i) => (
        <div
          key={i}
          className={cn(
            'overflow-hidden',
            items.length === 3 && i === 0 && 'row-span-2'
          )}
        >
          <MediaThumb
            item={item}
            count={i === 3 && items.length > 4 ? items.length - 3 : 1}
            onOpen={() => onOpen(i)}
            remainingOverlay={i === 3 && items.length > 4 ? items.length - 3 : undefined}
          />
        </div>
      ))}
    </div>
  )
}

function MediaThumb({
  item,
  count,
  onOpen,
  compact,
  remainingOverlay,
}: {
  item: BookmarkMedia
  count: number
  onOpen: () => void
  compact?: boolean
  remainingOverlay?: number
}) {
  const urlNoQuery = item.url.toLowerCase().split('?')[0]
  const isStaticImage =
    item.type === 'image' ||
    urlNoQuery.endsWith('.jpg') ||
    urlNoQuery.endsWith('.jpeg') ||
    urlNoQuery.endsWith('.png') ||
    urlNoQuery.endsWith('.webp')
  const isVideo = !isStaticImage && (item.type === 'video' || item.type === 'gif')
  const height = compact ? 'h-full' : 'max-h-72'

  return (
    <div
      className={cn('group relative w-full cursor-pointer', height)}
      onClick={onOpen}
      role="button"
      aria-label="View media"
    >
      {isVideo ? (
        <video
          src={item.url}
          className={cn('w-full object-cover', height)}
          muted
          loop
          autoPlay={item.type === 'gif'}
          playsInline
          preload="metadata"
        />
      ) : (
        <img
          src={item.url}
          alt={item.alt ?? 'Post media'}
          className={cn('w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]', height)}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
      )}

      {/* Overlay: play icon for video */}
      {item.type === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
      )}

      {/* Overlay: +N more */}
      {remainingOverlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <span className="text-xl font-bold text-white">+{remainingOverlay}</span>
        </div>
      )}

      {/* Multi-image indicator (top-right corner) */}
      {count > 1 && !remainingOverlay && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
          <Images className="h-3 w-3" />
          {count}
        </div>
      )}
    </div>
  )
}
