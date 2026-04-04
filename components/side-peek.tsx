'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { formatDistanceToNow } from 'date-fns'
import { X, ExternalLink, Heart, Repeat2, MessageCircle, Play } from 'lucide-react'
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

// ─── Desktop side panel (rendered inline in the flex row) ────────────────────

export function SidePeekPanel({ bookmark, onClose }: SidePeekProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const isOpen = !!bookmark

  useEffect(() => setViewerIndex(null), [bookmark])

  const media = bookmark?.media?.filter((m) => m.url) ?? []

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col border-l border-border bg-card',
        'transition-all duration-300 ease-in-out overflow-hidden',
        isOpen ? 'w-[420px]' : 'w-0 border-l-0'
      )}
    >
      {isOpen && bookmark && (
        <>
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Full Tweet</span>
            <div className="flex items-center gap-1">
              <a
                href={bookmark.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Open on X"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
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
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
            <PeekContent bookmark={bookmark} media={media} onOpenViewer={setViewerIndex} />
          </div>
        </>
      )}

      {/* Fullscreen media viewer */}
      {viewerIndex !== null && media.length > 0 && (
        <MediaViewer items={media} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </aside>
  )
}

// ─── Mobile bottom sheet (portal) ────────────────────────────────────────────

export function SidePeekSheet({ bookmark, onClose }: SidePeekProps) {
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)
  const isOpen = !!bookmark

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => setViewerIndex(null), [bookmark])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && viewerIndex === null && isOpen) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, viewerIndex, isOpen])

  const media = bookmark?.media?.filter((m) => m.url) ?? []

  if (!mounted) return null

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-2xl border-t border-border bg-card shadow-2xl md:hidden',
          'h-[85dvh] transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-y-0' : 'translate-y-full'
        )}
      >
        {/* Drag handle */}
        <div className="flex justify-center pb-1 pt-3">
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
            <PeekContent bookmark={bookmark} media={media} onOpenViewer={setViewerIndex} />
          </div>
        )}
      </div>

      {/* Fullscreen media viewer */}
      {viewerIndex !== null && media.length > 0 && (
        <MediaViewer items={media} initialIndex={viewerIndex} onClose={() => setViewerIndex(null)} />
      )}
    </>,
    document.body
  )
}

// ─── Combined export (backwards compat) ──────────────────────────────────────

export function SidePeek({ bookmark, onClose }: SidePeekProps) {
  return (
    <>
      <SidePeekSheet bookmark={bookmark} onClose={onClose} />
    </>
  )
}

// ─── Shared content ───────────────────────────────────────────────────────────

function PeekContent({
  bookmark,
  media,
  onOpenViewer,
}: {
  bookmark: Bookmark
  media: BookmarkMedia[]
  onOpenViewer: (index: number) => void
}) {
  const timeAgo = formatDistanceToNow(new Date(bookmark.savedAt), { addSuffix: true })

  return (
    <>
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
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-semibold text-foreground">{bookmark.author.name}</span>
          <span className="text-sm text-muted-foreground">@{bookmark.author.handle}</span>
        </div>
      </div>

      {/* Full text */}
      <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
        <RichText text={bookmark.text} />
      </p>

      {/* Media */}
      {media.length > 0 && (
        <div className="flex flex-col gap-2">
          {media.map((item, i) => (
            <div
              key={i}
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-muted"
              onClick={() => onOpenViewer(i)}
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
                <div className="relative">
                  <video
                    src={item.url}
                    className="w-full"
                    controls={item.type === 'video'}
                    autoPlay={item.type === 'gif'}
                    loop={item.type === 'gif'}
                    muted={item.type === 'gif'}
                    playsInline
                  />
                  {item.type === 'video' && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/60">
                        <Play className="h-5 w-5 fill-white text-white" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Timestamp */}
      <p className="text-xs text-muted-foreground">
        {timeAgo}
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

      {/* Open on X */}
      <a
        href={bookmark.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="h-4 w-4" />
        Open on X
      </a>
    </>
  )
}
