import React, { useState } from 'react'
import { MapPin, Lightbulb, Share2, Image as ImageIcon, Home } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import MediaGallery from './MediaGallery'
import './BottomNav.css'

function BottomNav({ onAdviceClick, onShareClick }) {
  const language = useStore((state) => state.language || 'en')
  const selectedDot = useStore((state) => state.selectedDot)
  const [activeTab, setActiveTab] = useState('home')

  return (
    <nav className="bottom-nav">
      <button
        className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
        onClick={() => setActiveTab('home')}
        title={getTranslation('home', language) || 'Home'}
      >
        <Home size={22} />
        <span>{getTranslation('home', language) || 'Home'}</span>
      </button>

      <button
        className={`nav-item ${activeTab === 'gallery' ? 'active' : ''}`}
        onClick={() => {
          setActiveTab('gallery')
          document.querySelector('.gallery-toggle')?.click()
        }}
        title={getTranslation('mediaGallery', language) || 'Gallery'}
      >
        <ImageIcon size={22} />
        <span>{getTranslation('gallery', language) || 'Gallery'}</span>
      </button>

      <button
        className="nav-item nav-item-primary"
        onClick={onAdviceClick}
        title={getTranslation('shareAdvice', language) || 'Share Advice'}
      >
        <Lightbulb size={24} />
      </button>

      {selectedDot && (
        <button
          className="nav-item"
          onClick={onShareClick}
          title={getTranslation('share', language) || 'Share'}
        >
          <Share2 size={22} />
          <span>{getTranslation('share', language) || 'Share'}</span>
        </button>
      )}

      <button
        className={`nav-item ${activeTab === 'locations' ? 'active' : ''}`}
        onClick={() => setActiveTab('locations')}
        title={getTranslation('locations', language) || 'Locations'}
      >
        <MapPin size={22} />
        <span>{getTranslation('locations', language) || 'Locations'}</span>
      </button>
    </nav>
  )
}

export default BottomNav

