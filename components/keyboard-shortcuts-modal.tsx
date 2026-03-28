'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Keyboard } from 'lucide-react'

interface Shortcut {
  keys: string[]
  description: string
}

const SHORTCUT_GROUPS: Array<{ label: string; shortcuts: Shortcut[] }> = [
  {
    label: 'Navigation',
    shortcuts: [
      { keys: ['↓', 'j', 'Space'], description: 'Next bookmark' },
      { keys: ['↑', 'k'], description: 'Previous bookmark' },
      { keys: ['Home'], description: 'First bookmark' },
      { keys: ['End'], description: 'Last bookmark' },
    ],
  },
  {
    label: 'Search & Filter',
    shortcuts: [
      { keys: ['/'], description: 'Open search' },
      { keys: ['Esc'], description: 'Close search / dismiss' },
    ],
  },
  {
    label: 'App',
    shortcuts: [
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
]

export function KeyboardShortcutsModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Open on ? (shift+/) when not in an input
      if (
        e.key === '?' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-muted-foreground" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {SHORTCUT_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <div className="flex flex-col gap-1.5">
                {group.shortcuts.map((s) => (
                  <div key={s.description} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-foreground">{s.description}</span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((key, i) => (
                        <span key={key} className="flex items-center gap-1">
                          <kbd className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-xs text-foreground">
                            {key}
                          </kbd>
                          {i < s.keys.length - 1 && (
                            <span className="text-xs text-muted-foreground">or</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="mt-1 text-center text-xs text-muted-foreground">
          Press <kbd className="rounded border border-border bg-muted px-1 font-mono text-xs">?</kbd> to toggle this panel
        </p>
      </DialogContent>
    </Dialog>
  )
}
