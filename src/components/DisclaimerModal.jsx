import React, { useState, useEffect } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './DisclaimerModal.css'

function DisclaimerModal() {
  const [show, setShow] = useState(false)
  const language = useStore((state) => state.language || 'en')

  useEffect(() => {
    // Check if user has already accepted the disclaimer
    const disclaimerAccepted = localStorage.getItem('disclaimerAccepted')
    if (!disclaimerAccepted) {
      setShow(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('disclaimerAccepted', 'true')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="disclaimer-overlay">
      <div className="disclaimer-modal">
        <button 
          className="disclaimer-close-btn"
          onClick={handleAccept}
          aria-label={getTranslation('close', language)}
        >
          <X size={20} />
        </button>
        
        <div className="disclaimer-header">
          <AlertTriangle size={32} className="disclaimer-icon" />
          <h2>{getTranslation('disclaimerTitle', language)}</h2>
        </div>

        <div className="disclaimer-content">
          <div className="disclaimer-text">
            <p className="disclaimer-main-text">
              {getTranslation('disclaimerMainText', language)}
            </p>
            
            <div className="disclaimer-points">
              <h3>{getTranslation('disclaimerImportant', language)}</h3>
              <ul>
                <li>{getTranslation('disclaimerPoint1', language)}</li>
                <li>{getTranslation('disclaimerPoint2', language)}</li>
                <li>{getTranslation('disclaimerPoint3', language)}</li>
                <li>{getTranslation('disclaimerPoint4', language)}</li>
              </ul>
            </div>

            <p className="disclaimer-footer">
              {getTranslation('disclaimerFooter', language)}
            </p>
          </div>
        </div>

        <div className="disclaimer-actions">
          <button
            className="disclaimer-accept-btn"
            onClick={handleAccept}
          >
            {getTranslation('disclaimerAccept', language)}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DisclaimerModal

