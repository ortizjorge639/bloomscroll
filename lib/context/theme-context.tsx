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
  // Read the class already applied by the inline ThemeInitScript so state
  // matches the DOM from the very first render — no second paint needed.
  const [theme, setThemeState] = useState<AppTheme>(() => {
    if (typeof window === 'undefined') return 'dark'
    const html = document.documentElement
    for (const t of ['dark', 'light', 'sunny', 'moonshine'] as AppTheme[]) {
      if (html.classList.contains(t)) return t
    }
    return 'dark'
  })

  const setTheme = useCallback((newTheme: AppTheme) => {
    setThemeState(newTheme)
    // Update the <html> class list
    const html = document.documentElement
    html.classList.remove('dark', 'light', 'sunny', 'moonshine')
    html.classList.add(newTheme)
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

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
