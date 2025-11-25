import React, { useState } from 'react'
import { Share2, Plus, X, ExternalLink } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './SocialLinks.css'

const platforms = [
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: '#000000' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: '#E4405F' },
  { id: 'twitter', name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  { id: 'youtube', name: 'YouTube', icon: '📺', color: '#FF0000' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: '#0077B5' },
  { id: 'snapchat', name: 'Snapchat', icon: '👻', color: '#FFFC00' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: '#BD081C' }
]

function SocialLinks() {
  const language = useStore((state) => state.language || 'en')
  const [isOpen, setIsOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState('')
  const [url, setUrl] = useState('')
  const socialLinks = useStore((state) => state.socialLinks || [])
  const setSocialLinks = useStore((state) => state.setSocialLinks)
  const donateLink = useStore((state) => state.donateLink)
  const setDonateLink = useStore((state) => state.setDonateLink)

  const handleAddLink = () => {
    if (selectedPlatform && url) {
      const newLink = {
        id: Date.now(),
        platform: selectedPlatform,
        url: url,
        name: platforms.find(p => p.id === selectedPlatform)?.name || selectedPlatform
      }
      setSocialLinks([...socialLinks, newLink])
      setSelectedPlatform('')
      setUrl('')
      setShowAddForm(false)
    }
  }

  const handleDeleteLink = (id) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id))
  }

  const handleSetDonateLink = () => {
    const link = prompt(getTranslation('enterPayPalLink', language) || 'Enter PayPal donation link:')
    if (link) {
      setDonateLink(link)
    }
  }

  return (
    <div className="social-links-container">
      <button
        className="social-links-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Share2 size={18} />
        <span>{getTranslation('socialLinks', language)}</span>
      </button>

      {isOpen && (
        <>
          <div className="social-overlay" onClick={() => setIsOpen(false)} />
          <div className="social-panel">
            <div className="social-panel-header">
              <h3>{getTranslation('socialLinks', language)}</h3>
              <button className="close-panel" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {donateLink && (
              <div className="donate-section">
                <a
                  href={donateLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="donate-link"
                >
                  <span className="donate-icon">💝</span>
                  <span>{getTranslation('donate', language)}</span>
                  <ExternalLink size={14} />
                </a>
                <button
                  className="remove-donate"
                  onClick={() => setDonateLink('')}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {!donateLink && (
              <button
                className="add-donate-btn"
                onClick={handleSetDonateLink}
              >
                <span>💝</span>
                {getTranslation('addDonateLink', language) || 'Add Donation Link'}
              </button>
            )}

            <div className="links-list">
              {socialLinks.map((link) => {
                const platform = platforms.find(p => p.id === link.platform)
                return (
                  <div key={link.id} className="link-item">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-content"
                    >
                      <span className="link-icon">{platform?.icon || '🔗'}</span>
                      <span className="link-name">{link.name}</span>
                      <ExternalLink size={14} />
                    </a>
                    <button
                      className="remove-link"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )
              })}
            </div>

            {showAddForm ? (
              <div className="add-link-form">
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="platform-select"
                >
                  <option value="">{getTranslation('selectPlatform', language) || 'Select Platform'}</option>
                  {platforms.map(platform => (
                    <option key={platform.id} value={platform.id}>
                      {platform.icon} {platform.name}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  placeholder={getTranslation('url', language)}
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="url-input"
                />
                <div className="form-actions">
                  <button onClick={handleAddLink} className="save-btn">
                    {getTranslation('save', language)}
                  </button>
                  <button onClick={() => setShowAddForm(false)} className="cancel-btn">
                    {getTranslation('cancel', language)}
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="add-link-btn"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={18} />
                {getTranslation('addSocialLink', language)}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default SocialLinks

