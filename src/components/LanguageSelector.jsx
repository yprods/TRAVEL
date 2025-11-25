import React from 'react'
import { Globe as GlobeIcon } from 'lucide-react'
import { useStore } from '../store'
import './LanguageSelector.css'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'he', name: 'עברית', flag: '🇮🇱' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' }
]

function LanguageSelector() {
  const language = useStore((state) => state.language || 'en')
  const setLanguage = useStore((state) => state.setLanguage)

  const [isOpen, setIsOpen] = React.useState(false)

  const currentLang = languages.find(l => l.code === language) || languages[0]

  return (
    <div className="language-selector-inline">
      <button
        className="language-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <GlobeIcon size={18} />
        <span>{currentLang.flag}</span>
        <span className="lang-name">{currentLang.name}</span>
      </button>

      {isOpen && (
        <>
          <div className="language-overlay" onClick={() => setIsOpen(false)} />
          <div className="language-dropdown">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`language-option ${language === lang.code ? 'active' : ''}`}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
              >
                <span className="lang-flag">{lang.flag}</span>
                <span className="lang-name">{lang.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default LanguageSelector

