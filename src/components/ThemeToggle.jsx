import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useStore } from '../store'
import './ThemeToggle.css'

function ThemeToggle() {
  const theme = useStore((state) => state.theme || 'light')
  const setTheme = useStore((state) => state.setTheme)

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
}

export default ThemeToggle

