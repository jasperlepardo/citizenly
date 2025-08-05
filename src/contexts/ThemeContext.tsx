'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark' // The actual computed theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Provide a fallback during SSR or if used outside provider
    return {
      theme: 'system' as Theme,
      actualTheme: 'light' as 'light' | 'dark',
      setTheme: () => {},
      toggleTheme: () => {}
    }
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'rbi-theme',
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // Set mounted flag after hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (!mounted) return

    const storedTheme = localStorage.getItem(storageKey) as Theme
    if (storedTheme && ['light', 'dark', 'system'].includes(storedTheme)) {
      setTheme(storedTheme)
    } else {
      // Default to system preference if no stored preference
      setTheme('system')
    }
  }, [storageKey, mounted])

  // Update actual theme when theme changes
  useEffect(() => {
    if (!mounted) return

    let newActualTheme: 'light' | 'dark'
    
    if (theme === 'system') {
      newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    } else {
      newActualTheme = theme
    }
    
    setActualTheme(newActualTheme)
    
    // Apply theme to document
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(newActualTheme)
    
    // Update data attribute for CSS selectors
    root.setAttribute('data-theme', newActualTheme)
    
    // Store theme preference
    localStorage.setItem(storageKey, theme)
  }, [theme, storageKey, mounted])

  // Listen to system theme changes
  useEffect(() => {
    if (!mounted || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      const newTheme = e.matches ? 'dark' : 'light'
      setActualTheme(newTheme)
      
      // Apply theme change to document immediately
      const root = document.documentElement
      root.classList.remove('light', 'dark')
      root.classList.add(newTheme)
      root.setAttribute('data-theme', newTheme)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  const value: ThemeContextType = {
    theme,
    actualTheme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}