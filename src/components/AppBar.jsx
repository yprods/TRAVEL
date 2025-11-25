import React, { useState } from 'react'
import { Menu, X, Search, Globe, Users, Calendar, Settings, User, LogOut } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import LanguageSelector from './LanguageSelector'
import ThemeToggle from './ThemeToggle'
import SearchBar from './SearchBar'
import './AppBar.css'

function AppBar({ onMenuToggle, menuOpen }) {
  const language = useStore((state) => state.language || 'en')
  const user = useStore((state) => state.user)
  const setUser = useStore((state) => state.setUser)

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('userToken')
    localStorage.removeItem('user')
  }

  return (
    <div className="app-bar">
      <div className="app-bar-left">
        <button 
          className="menu-toggle-btn"
          onClick={onMenuToggle}
          aria-label="Menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="app-title">
          <Globe size={24} />
          <span>{getTranslation('appTitle', language) || 'Globe Travel'}</span>
        </div>
      </div>

      <div className="app-bar-center">
        <SearchBar />
      </div>

      <div className="app-bar-right">
        <div className="app-bar-actions">
          {user ? (
            <>
              <div className="user-info">
                <User size={18} />
                <span className="user-name">{user.name || user.email}</span>
              </div>
              <button 
                className="icon-btn logout-btn"
                onClick={handleLogout}
                title={getTranslation('logout', language) || 'Logout'}
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button 
              className="signup-btn-small"
              onClick={() => {
                const event = new CustomEvent('openSignup')
                window.dispatchEvent(event)
              }}
            >
              <User size={18} />
              <span>{getTranslation('signUp', language) || 'Sign Up'}</span>
            </button>
          )}
          <LanguageSelector />
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}

export default AppBar

