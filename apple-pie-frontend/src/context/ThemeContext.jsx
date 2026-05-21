/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const THEME_KEY = 'apple-pie-theme'
const FONT_SIZE_KEY = 'apple-pie-font-size'
const INVERT_KEY = 'apple-pie-invert-colors'
const TTS_KEY = 'apple-pie-tts'

const FONT_SIZE_CLASSES = ['text-large', 'text-xlarge']

const ThemeContext = createContext(null)

function readFontSize() {
  if (typeof window === 'undefined') return 'normal'
  const stored = localStorage.getItem(FONT_SIZE_KEY)
  if (stored === 'large' || stored === 'xlarge') return stored
  return 'normal'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  })

  const [fontSize, setFontSizeState] = useState(readFontSize)

  const [invertColors, setInvertColors] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(INVERT_KEY) === 'true'
  })

  const [tts, setTts] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(TTS_KEY) === 'true'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove(...FONT_SIZE_CLASSES)
    if (fontSize === 'large') root.classList.add('text-large')
    if (fontSize === 'xlarge') root.classList.add('text-xlarge')
    localStorage.setItem(FONT_SIZE_KEY, fontSize)
  }, [fontSize])

  useEffect(() => {
    const root = document.documentElement
    if (invertColors) {
      root.classList.add('invert-colors')
    } else {
      root.classList.remove('invert-colors')
    }
    localStorage.setItem(INVERT_KEY, String(invertColors))
  }, [invertColors])

  useEffect(() => {
    localStorage.setItem(TTS_KEY, String(tts))
  }, [tts])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
  }, [])

  const setFontSize = useCallback((size) => {
    if (size === 'normal' || size === 'large' || size === 'xlarge') {
      setFontSizeState(size)
    }
  }, [])

  const toggleInvertColors = useCallback(() => {
    setInvertColors((v) => !v)
  }, [])

  const toggleTts = useCallback(() => {
    setTts((v) => !v)
  }, [])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
      isDark: theme === 'dark',
      fontSize,
      setFontSize,
      invertColors,
      toggleInvertColors,
      tts,
      toggleTts,
    }),
    [theme, toggleTheme, fontSize, setFontSize, invertColors, toggleInvertColors, tts, toggleTts],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider')
  }
  return ctx
}
