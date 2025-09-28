import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark' | 'auto'

interface ThemeContextType {
  theme: Theme
  actualTheme: 'light' | 'dark' // Gerçek uygulanan tema (auto durumunda hesaplanan)
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme
    return savedTheme || 'auto'
  })

  // Saate göre otomatik tema hesaplama
  const getTimeBasedTheme = (): 'light' | 'dark' => {
    const now = new Date()
    const hour = now.getHours()
    
    // Sabah 6:00 - Akşam 17:00 arası günışığı
    if (hour >= 6 && hour < 17) {
      return 'light'
    }
    // Akşam 17:00 - Sabah 6:00 arası karanlık
    return 'dark'
  }

  // Gerçek uygulanan tema (auto durumunda hesaplanan)
  const actualTheme = theme === 'auto' ? getTimeBasedTheme() : theme

  useEffect(() => {
    localStorage.setItem('theme', theme)
    document.documentElement.setAttribute('data-theme', actualTheme)
  }, [theme, actualTheme])

  // Otomatik tema kontrolü için interval
  useEffect(() => {
    if (theme !== 'auto') return

    const checkTime = () => {
      const newActualTheme = getTimeBasedTheme()
      if (newActualTheme !== actualTheme) {
        // Tema değişti, sayfayı yenile
        window.location.reload()
      }
    }

    // Her dakika kontrol et
    const interval = setInterval(checkTime, 60000)
    
    return () => clearInterval(interval)
  }, [theme, actualTheme])

  const toggleTheme = () => {
    setThemeState(prevTheme => {
      if (prevTheme === 'light') return 'dark'
      if (prevTheme === 'dark') return 'auto'
      return 'light'
    })
  }

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}



