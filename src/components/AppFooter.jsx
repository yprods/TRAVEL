import React from 'react'
import { Heart, Code } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './AppFooter.css'

function AppFooter() {
  const language = useStore((state) => state.language || 'en')
  const donateLink = useStore((state) => state.donateLink)

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-credits">
          <Code size={16} />
          <span>
            {getTranslation('madeBy', language) || 'Made by'} <strong>AI</strong> & <strong>yprods</strong>
          </span>
          <Heart size={14} className="heart-icon" />
        </div>
        {donateLink && (
          <a
            href={donateLink}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-donate-link"
          >
            💝 {getTranslation('supportUs', language) || 'Support Us'}
          </a>
        )}
      </div>
    </footer>
  )
}

export default AppFooter

