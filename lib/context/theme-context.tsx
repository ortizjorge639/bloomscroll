'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

export type AppTheme = 'dark' | 'light' | 'sunny' | 'moonshine'

export const THEMES: { id: AppTheme; label: string; description: string }[] = [
  {
    id: 'dark',
    label: 'Dark',
    description: 'Pure black canvas, easy on the eyes',
  },
  {
    id: 'light',
    label: 'Light',
    description: 'Clean white background, crisp text',
  },
  {
    id: 'sunny',
    label: 'Sunny',
    description: 'Warm cream with deep forest green',
  },
  {
    id: 'moonshine',
    label: 'Moonshine',
    description: 'Deep navy with a soft lunar glow',
  },
]

const STORAGE_KEY = 'bloomscroll-theme'

interface ThemeContextValue {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>('dark')

  // Load saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as AppTheme | null
      if (saved && THEMES.some((t) => t.id === saved)) {
        setThemeState(saved)
        applyTheme(saved)
      } else {
        applyTheme('dark')
      }
    } catch {
      applyTheme('dark')
    }
  }, [])

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    try {
      localStorage.setItem(STORAGE_KEY, newTheme)
    } catch {
      // ignore
    }
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

function applyTheme(theme: AppTheme) {
  const html = document.documentElement
  // Remove all theme classes
  html.classList.remove('dark', 'light', 'sunny', 'moonshine')
  // Apply the new theme class
  html.classList.add(theme)
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
