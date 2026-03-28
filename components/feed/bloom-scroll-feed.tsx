'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useData } from '@/lib/context/data-context'
import { PostCard } from '@/components/feed/post-card'
import { EmptyState } from '@/components/empty-state'
import { Spinner } from '@/components/ui/spinner'
import { PopupBrowser } from '@/components/browser/popup-browser'
import { ChevronUp, ChevronDown, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BloomScrollFeed() {
  const { filteredBookmarks, isLoading } = useData()
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [browserUrl, setBrowserUrl] = useState<string | null>(null)

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

  if (filteredBookmarks.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        title="No bookmarks yet"
        description="Import your X bookmarks to start scrolling your knowledge feed."
        showImportGuide
      />
    )
  }

  return (
    <>
      <div
        ref={containerRef}
        className="relative flex-1 overflow-y-auto snap-feed hide-scrollbar"
      >
        {filteredBookmarks.map((bookmark, index) => (
          <div
            key={bookmark.id}
            className="h-full min-h-full w-full snap-card"
          >
            <PostCard
              bookmark={bookmark}
              variant="feed"
              onOpenBrowser={handleOpenBrowser}
            />
          </div>
        ))}
      </div>

      {/* Navigation indicators */}
      <div className="absolute bottom-20 right-4 flex flex-col items-center gap-2 md:bottom-6 md:right-6">
        {/* Progress */}
        <div className="rounded-full bg-card/80 px-2.5 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur-sm md:px-3 md:py-1.5 md:text-xs">
          {currentIndex + 1} / {filteredBookmarks.length}
        </div>

        {/* Navigation buttons - hidden on mobile, use swipe instead */}
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
    </>
  )
}
