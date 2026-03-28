'use client'

import { useEffect, useCallback } from 'react'
import { X, ExternalLink, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PopupBrowserProps {
  url: string | null
  onClose: () => void
}

export function PopupBrowser({ url, onClose }: PopupBrowserProps) {
  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (url) {
      window.addEventListener('keydown', handleKeyDown)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [url, handleKeyDown])

  const handleOpenExternal = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  if (!url) return null

  // Extract domain for display
  let displayUrl = url
  try {
    const parsed = new URL(url)
    displayUrl = parsed.hostname + parsed.pathname
  } catch {
    // Use original URL if parsing fails
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Browser preview"
    >
      <div
        className={cn(
          'relative flex h-[90vh] w-[90vw] max-w-5xl flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl',
          'animate-in fade-in zoom-in-95 duration-200'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
          <div className="flex items-center gap-3">
            {/* Window controls (decorative) */}
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-destructive/60" />
              <div className="h-3 w-3 rounded-full bg-warning/60" />
              <div className="h-3 w-3 rounded-full bg-success/60" />
            </div>

            {/* URL bar */}
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
              <span className="max-w-md truncate text-xs text-muted-foreground">
                {displayUrl}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleOpenExternal}
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleOpenExternal}
              title="Open fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="relative flex-1 bg-white">
          {/* Loading state shown as background */}
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
              <p className="text-sm text-muted-foreground">Loading preview...</p>
            </div>
          </div>

          {/* Iframe */}
          <iframe
            src={url}
            className="relative z-10 h-full w-full border-0"
            title="Content preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
            loading="lazy"
          />
        </div>

        {/* Footer hint */}
        <footer className="flex h-10 shrink-0 items-center justify-center border-t border-border bg-card px-4">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> to close
          </p>
        </footer>
      </div>
    </div>
  )
}
