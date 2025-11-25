import React, { useState } from 'react'
import { Accessibility, X, Type, Contrast, ZoomIn, Volume2 } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './AccessibilityButton.css'

function AccessibilityButton() {
  const language = useStore((state) => state.language || 'he')
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [highContrast, setHighContrast] = useState(false)
  const [zoom, setZoom] = useState(100)

  const increaseFontSize = () => {
    const newSize = Math.min(fontSize + 2, 24)
    setFontSize(newSize)
    document.documentElement.style.fontSize = `${newSize}px`
  }

  const decreaseFontSize = () => {
    const newSize = Math.max(fontSize - 2, 12)
    setFontSize(newSize)
    document.documentElement.style.fontSize = `${newSize}px`
  }

  const toggleContrast = () => {
    const newContrast = !highContrast
    setHighContrast(newContrast)
    if (newContrast) {
      document.body.classList.add('high-contrast')
    } else {
      document.body.classList.remove('high-contrast')
    }
  }

  const increaseZoom = () => {
    const newZoom = Math.min(zoom + 10, 200)
    setZoom(newZoom)
    document.body.style.zoom = `${newZoom}%`
  }

  const decreaseZoom = () => {
    const newZoom = Math.max(zoom - 10, 50)
    setZoom(newZoom)
    document.body.style.zoom = `${newZoom}%`
  }

  const resetAccessibility = () => {
    setFontSize(16)
    setHighContrast(false)
    setZoom(100)
    document.documentElement.style.fontSize = ''
    document.body.classList.remove('high-contrast')
    document.body.style.zoom = ''
  }

  return (
    <>
      <button
        className="accessibility-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={getTranslation('accessibility', language) || 'Accessibility'}
        title={getTranslation('accessibility', language) || 'Accessibility'}
      >
        <Accessibility size={20} />
      </button>

      {isOpen && (
        <div className="accessibility-panel">
          <div className="accessibility-header">
            <h3>{getTranslation('accessibility', language) || 'Accessibility'}</h3>
            <button
              className="close-accessibility"
              onClick={() => setIsOpen(false)}
              aria-label={getTranslation('close', language) || 'Close'}
            >
              <X size={18} />
            </button>
          </div>

          <div className="accessibility-controls">
            <div className="accessibility-group">
              <div className="group-header">
                <Type size={18} />
                <span>{getTranslation('fontSize', language) || 'Font Size'}</span>
              </div>
              <div className="group-controls">
                <button onClick={decreaseFontSize} aria-label="Decrease font size">-</button>
                <span>{fontSize}px</span>
                <button onClick={increaseFontSize} aria-label="Increase font size">+</button>
              </div>
            </div>

            <div className="accessibility-group">
              <div className="group-header">
                <Contrast size={18} />
                <span>{getTranslation('highContrast', language) || 'High Contrast'}</span>
              </div>
              <button
                className={`toggle-btn ${highContrast ? 'active' : ''}`}
                onClick={toggleContrast}
              >
                {highContrast ? getTranslation('on', language) || 'ON' : getTranslation('off', language) || 'OFF'}
              </button>
            </div>

            <div className="accessibility-group">
              <div className="group-header">
                <ZoomIn size={18} />
                <span>{getTranslation('zoom', language) || 'Zoom'}</span>
              </div>
              <div className="group-controls">
                <button onClick={decreaseZoom} aria-label="Decrease zoom">-</button>
                <span>{zoom}%</span>
                <button onClick={increaseZoom} aria-label="Increase zoom">+</button>
              </div>
            </div>

            <button
              className="reset-accessibility-btn"
              onClick={resetAccessibility}
            >
              {getTranslation('reset', language) || 'Reset'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default AccessibilityButton

