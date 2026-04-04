'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { X, ExternalLink, Heart, Repeat2, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RichText } from '@/components/rich-text'
import { MediaViewer } from '@/components/media-viewer'
import type { Bookmark, BookmarkMedia } from '@/types'

interface SidePeekProps {
  bookmark: Bookmark | null
  onClose: () => void
}

function isImageUrl(item: BookmarkMedia): boolean {
  if (item.type === 'image') return true
  const url = item.url.toLowerCase().split('?')[0]
  return url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.webp')
}

function upgradeImageUrl(url: string): string {
  if (!url.includes('pbs.twimg.com')) return url
  return url.replace(/name=\w+/, 'name=large')
}

export function SidePeek({ bookmark, onClose }: SidePeekProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const isOpen = !!bookmark

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerIndex === null) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, viewerIndex])

  // Reset viewer when bookmark changes
  useEffect(() => setViewerIndex(null), [bookmark])

  const media = bookmark?.media?.filter((m) => m.url) ?? []

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className={cn(
          // Base
          'fixed z-40 flex flex-col bg-card shadow-2xl transition-transform duration-300 ease-in-out',
          // Desktop: right side panel
          'md:inset-y-0 md:right-0 md:w-[420px] md:border-l md:border-border',
          // Mobile: bottom sheet
          'inset-x-0 bottom-0 h-[85dvh] rounded-t-2xl border-t border-border md:h-auto md:rounded-none',
          // Open / closed
          isOpen
            ? 'translate-x-0 translate-y-0'
            : 'md:translate-x-full translate-y-full md:translate-y-0'
        )}
      >
        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
          <span className="text-sm font-semibold text-foreground">Full Tweet</span>
          <div className="flex items-center gap-1">
            {bookmark && (
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Open on X"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        {bookmark && (
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            {/* Author */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted">
                {bookmark.author.avatar ? (
                  <img
                    src={bookmark.author.avatar}
                    alt={bookmark.author.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <span className="text-base font-semibold">
                    {bookmark.author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-foreground">{bookmark.author.name}</span>
                <span className="text-sm text-muted-foreground">@{bookmark.author.handle}</span>
              </div>
            </div>

            {/* Full text */}
            <p className="text-base leading-relaxed text-foreground">
              <RichText text={bookmark.text} />
            </p>

            {/* Media */}
            {media.length > 0 && (
              <div className="flex flex-col gap-2">
                {media.map((item, i) => (
                  <div
                    key={i}
                    className="group relative cursor-pointer overflow-hidden rounded-xl bg-muted"
                    onClick={() => setViewerIndex(i)}
                  >
                    {isImageUrl(item) ? (
                      <img
                        src={upgradeImageUrl(item.url)}
                        alt={item.alt ?? 'Media'}
                        className="w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement
                          el.parentElement!.style.display = 'none'
                        }}
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full"
                        controls={item.type === 'video'}
                        autoPlay={item.type === 'gif'}
                        loop={item.type === 'gif'}
                        muted={item.type === 'gif'}
                        playsInline
                      />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(bookmark.timestamp), { addSuffix: true })}
              {' · '}
              {new Date(bookmark.timestamp).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>

            {/* Metrics */}
            {bookmark.metrics && (
              <div className="flex items-center gap-5 border-t border-border pt-3">
                {bookmark.metrics.likes !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Heart className="h-4 w-4" />
                    <span>{bookmark.metrics.likes.toLocaleString()}</span>
                  </div>
                )}
                {bookmark.metrics.retweets !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Repeat2 className="h-4 w-4" />
                    <span>{bookmark.metrics.retweets.toLocaleString()}</span>
                  </div>
                )}
                {bookmark.metrics.replies !== undefined && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    <span>{bookmark.metrics.replies.toLocaleString()}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Fullscreen media viewer */}
      {viewerIndex !== null && media.length > 0 && (
        <MediaViewer items={media} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </>
  )
}
