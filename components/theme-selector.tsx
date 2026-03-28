'use client'

import { useTheme, THEMES, type AppTheme } from '@/lib/context/theme-context'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'

// Miniature color swatches representing each theme
const THEME_SWATCHES: Record<AppTheme, { bg: string; surface: string; text: string; accent: string }> = {
  dark: {
    bg: '#000000',
    surface: '#111111',
    text: '#ebebeb',
    accent: '#3b82f6',
  },
  light: {
    bg: '#f9f9f9',
    surface: '#ffffff',
    text: '#1a1a1a',
    accent: '#2563eb',
  },
  sunny: {
    bg: '#f5edd8',
    surface: '#fdf6e8',
    text: '#1a3a20',
    accent: '#2e6b38',
  },
  moonshine: {
    bg: '#0b0f1e',
    surface: '#141929',
    text: '#d4e4f0',
    accent: '#7ec8e3',
  },
}

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {THEMES.map((t) => {
        const swatch = THEME_SWATCHES[t.id]
        const isActive = theme === t.id

        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            className={cn(
              'group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02]',
              isActive
                ? 'border-primary shadow-md shadow-primary/20'
                : 'border-border hover:border-muted-foreground/40'
            )}
            aria-label={`Switch to ${t.label} theme`}
            aria-pressed={isActive}
          >
            {/* Mini UI preview */}
            <div
              className="relative h-20 w-full overflow-hidden"
              style={{ background: swatch.bg }}
            >
              {/* Moonshine glow */}
              {t.id === 'moonshine' && (
                <div
                  className="absolute -right-4 -top-6 h-20 w-20 rounded-full opacity-30"
                  style={{
                    background: `radial-gradient(circle, ${swatch.accent}55 0%, transparent 70%)`,
                  }}
                />
              )}
              {/* Sunny warm wash */}
              {t.id === 'sunny' && (
                <div
                  className="absolute -top-4 left-0 right-0 h-10 opacity-20"
                  style={{
                    background: `radial-gradient(ellipse 100% 100% at 50% 0%, #f5c842 0%, transparent 70%)`,
                  }}
                />
              )}
              {/* Simulated sidebar strip */}
              <div
                className="absolute inset-y-0 left-0 w-5"
                style={{
                  background:
                    t.id === 'dark'
                      ? '#080808'
                      : t.id === 'light'
                        ? '#f3f3f3'
                        : t.id === 'sunny'
                          ? '#eee5cc'
                          : '#08101f',
                }}
              />
              {/* Simulated content lines */}
              <div className="absolute inset-y-0 left-7 right-2 flex flex-col justify-center gap-1.5">
                <div
                  className="h-1.5 w-3/4 rounded-full opacity-80"
                  style={{ background: swatch.text }}
                />
                <div
                  className="h-1 w-1/2 rounded-full opacity-40"
                  style={{ background: swatch.text }}
                />
                <div
                  className="h-1 w-2/3 rounded-full opacity-30"
                  style={{ background: swatch.text }}
                />
                {/* Accent pill */}
                <div
                  className="mt-1 h-3 w-10 rounded-full opacity-90"
                  style={{ background: swatch.accent }}
                />
              </div>
            </div>

            {/* Label */}
            <div
              className="flex items-center justify-between px-3 py-2"
              style={{ background: swatch.surface }}
            >
              <div>
                <p
                  className="text-xs font-semibold leading-tight"
                  style={{ color: swatch.text }}
                >
                  {t.label}
                </p>
                <p
                  className="mt-0.5 text-[10px] leading-tight opacity-60"
                  style={{ color: swatch.text }}
                >
                  {t.description}
                </p>
              </div>
              {isActive && (
                <div
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ background: swatch.accent }}
                >
                  <Check className="h-2.5 w-2.5" style={{ color: swatch.bg }} />
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
