'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useData } from '@/lib/context/data-context'
import { PostCard } from '@/components/feed/post-card'
import { EmptyState } from '@/components/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { PopupBrowser } from '@/components/browser/popup-browser'
import { SidePeekPanel, SidePeekSheet } from '@/components/side-peek'
import { ChevronUp, ChevronDown, Layers, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Bookmark } from '@/types'
import type { ReadFilter } from '@/lib/context/data-context'

export function BloomScrollFeed() {
  const { filteredBookmarks, isLoading, readFilter, setReadFilter, unreadCount } = useData()
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [browserUrl, setBrowserUrl] = useState<string | null>(null)
  const [peekBookmark, setPeekBookmark] = useState<Bookmark | null>(null)

  // Scroll to specific index
  const scrollToIndex = useCallback((index: number) => {
    const container = containerRef.current
    if (!container || index < 0 || index >= filteredBookmarks.length) return

    const cards = container.querySelectorAll('.snap-card')
    if (cards[index]) {
      cards[index].scrollIntoView({ behavior: 'smooth', block: 'start' })
      setCurrentIndex(index)
    }
  }, [filteredBookmarks.length])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowDown':
        case 'j':
        case ' ':
          e.preventDefault()
          scrollToIndex(currentIndex + 1)
          break
        case 'ArrowUp':
        case 'k':
          e.preventDefault()
          scrollToIndex(currentIndex - 1)
          break
        case 'Home':
          e.preventDefault()
          scrollToIndex(0)
          break
        case 'End':
          e.preventDefault()
          scrollToIndex(filteredBookmarks.length - 1)
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, scrollToIndex, filteredBookmarks.length])

  // Track scroll position to update current index
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const cards = container.querySelectorAll('.snap-card')
      const containerRect = container.getBoundingClientRect()

      cards.forEach((card, index) => {
        const cardRect = card.getBoundingClientRect()
        // Check if card is mostly visible
        if (
          cardRect.top >= containerRect.top - 50 &&
          cardRect.top <= containerRect.top + 100
        ) {
          setCurrentIndex(index)
        }
      })
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const handleOpenBrowser = (url: string) => {
    setBrowserUrl(url)
  }

  const handleCloseBrowser = () => {
    setBrowserUrl(null)
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    )
  }

  if (filteredBookmarks.length === 0 && readFilter === 'unread') {
    return (
      <div className="flex flex-col h-full">
        <ReadFilterTabs readFilter={readFilter} setReadFilter={setReadFilter} unreadCount={unreadCount} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center px-6">
          <Sparkles className="h-10 w-10 text-muted-foreground opacity-40" />
          <p className="text-lg font-medium text-foreground">You're caught up 🌸</p>
          <p className="text-sm text-muted-foreground">No unread bookmarks. Switch to All to browse everything.</p>
        </div>
      </div>
    )
  }

  if (filteredBookmarks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <ReadFilterTabs readFilter={readFilter} setReadFilter={setReadFilter} unreadCount={unreadCount} />
        <EmptyState
          icon={Layers}
          title="No bookmarks yet"
          description="Import your X bookmarks to start scrolling your knowledge feed."
          showImportGuide
        />
      </div>
    )
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <ReadFilterTabs readFilter={readFilter} setReadFilter={setReadFilter} unreadCount={unreadCount} />
      {/* Scroll container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto snap-feed hide-scrollbar"
      >
        {filteredBookmarks.map((bookmark) => (
          <div
            key={bookmark.id}
            className="h-full min-h-full w-full snap-card"
          >
            <PostCard
              bookmark={bookmark}
              variant="feed"
              onOpenBrowser={handleOpenBrowser}
              onPeek={setPeekBookmark}
            />
          </div>
        ))}
      </div>

      {/* Desktop side panel — inline flex sibling, no fixed/portal needed */}
      <SidePeekPanel bookmark={peekBookmark} onClose={() => setPeekBookmark(null)} />

      {/* Navigation indicators */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center gap-2 md:bottom-6 md:right-6">
        <div className="rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm md:px-3 md:py-1.5 md:text-xs">
          {currentIndex + 1} / {filteredBookmarks.length}
        </div>
        <div className="hidden flex-col gap-1 md:flex">
          <button
            onClick={() => scrollToIndex(currentIndex - 1)}
            disabled={currentIndex === 0}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-all',
              currentIndex === 0
                ? 'cursor-not-allowed opacity-30'
                : 'hover:bg-card hover:scale-105'
            )}
            aria-label="Previous post"
          >
            <ChevronUp className="h-5 w-5 text-foreground" />
          </button>
          <button
            onClick={() => scrollToIndex(currentIndex + 1)}
            disabled={currentIndex === filteredBookmarks.length - 1}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm transition-all',
              currentIndex === filteredBookmarks.length - 1
                ? 'cursor-not-allowed opacity-30'
                : 'hover:bg-card hover:scale-105'
            )}
            aria-label="Next post"
          >
            <ChevronDown className="h-5 w-5 text-foreground" />
          </button>
        </div>
      </div>

      {/* Popup Browser */}
      <PopupBrowser url={browserUrl} onClose={handleCloseBrowser} />

      {/* Mobile bottom sheet — portal to document.body */}
      <SidePeekSheet bookmark={peekBookmark} onClose={() => setPeekBookmark(null)} />
    </div>
  )
}

function ReadFilterTabs({
  readFilter,
  setReadFilter,
  unreadCount,
}: {
  readFilter: ReadFilter
  setReadFilter: (f: ReadFilter) => void
  unreadCount: number
}) {
  const tabs: { key: ReadFilter; label: string; count?: number }[] = [
    { key: 'unread', label: 'Unread', count: unreadCount },
    { key: 'all', label: 'All' },
    { key: 'read', label: 'Read' },
  ]

  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-border bg-background px-3 py-2 md:px-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setReadFilter(tab.key)}
          className={cn(
            'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
            readFilter === tab.key
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          {tab.label}
          {tab.count !== undefined && tab.count > 0 && (
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                readFilter === tab.key
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
