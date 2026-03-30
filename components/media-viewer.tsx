'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BookmarkMedia } from '@/types'

interface MediaViewerProps {
  items: BookmarkMedia[]
  initialIndex?: number
  onClose: () => void
}

/** Upgrades pbs.twimg.com image URLs to high-res (`name=large`) */
function upgradeImageUrl(url: string): string {
  if (!url.includes('pbs.twimg.com')) return url
  return url.replace(/name=\w+/, 'name=large')
}

export function MediaViewer({ items, initialIndex = 0, onClose }: MediaViewerProps) {
  const [index, setIndex] = useState(initialIndex)

  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), [])
  const next = useCallback(
    () => setIndex((i) => Math.min(items.length - 1, i + 1)),
    [items.length]
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const item = items[index]
  if (!item) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
        onClick={onClose}
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Counter */}
      {items.length > 1 && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
          {index + 1} / {items.length}
        </div>
      )}

      {/* Media */}
      <div
        className="relative flex max-h-[90vh] max-w-[92vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.type === 'image' ? (
          <img
            src={upgradeImageUrl(item.url)}
            alt={item.alt ?? 'Post image'}
            className="max-h-[90vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
            draggable={false}
          />
        ) : (
          <video
            key={item.url} // remount when switching items
            src={item.url}
            className="max-h-[90vh] max-w-[92vw] rounded-xl shadow-2xl"
            controls={item.type === 'video'}
            autoPlay
            loop={item.type === 'gif'}
            muted={item.type === 'gif'}
            playsInline
          />
        )}
      </div>

      {/* Prev arrow */}
      {items.length > 1 && index > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          aria-label="Previous"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {/* Next arrow */}
      {items.length > 1 && index < items.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          className="absolute right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
          aria-label="Next"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-1.5">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setIndex(i) }}
              className={cn(
                'h-1.5 rounded-full transition-all',
                i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              )}
              aria-label={`Go to item ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
