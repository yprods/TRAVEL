import React, { useState } from 'react'
import { X, AlertCircle, ExternalLink } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './AdManager.css'

function AdManager() {
  const language = useStore((state) => state.language || 'en')
  const donateLink = useStore((state) => state.donateLink)
  const [showAdModal, setShowAdModal] = useState(false)
  const [adUrl, setAdUrl] = useState('')
  const [adImage, setAdImage] = useState('')
  const [ads, setAds] = useState([])

  const handleAddAd = () => {
    try {
      if (!donateLink) {
        throw new Error(getTranslation('addDonateLinkFirst', language) || 'Please add a donation link first!')
      }
      setShowAdModal(true)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleSaveAd = () => {
    try {
      if (!adUrl || !adImage) {
        throw new Error('Please provide both ad URL and image URL')
      }
      
      // Validate URLs
      try {
        new URL(adUrl)
        new URL(adImage)
      } catch {
        throw new Error('Invalid URL format')
      }
      
      const newAd = {
        id: Date.now(),
        url: adUrl,
        image: adImage,
        clicks: 0,
        views: 0
      }
      setAds([...ads, newAd])
      setAdUrl('')
      setAdImage('')
      setShowAdModal(false)
      
      // Show donation popup
      setTimeout(() => {
        if (window.confirm(getTranslation('supportWithDonation', language) || 'Support us with a donation?')) {
          window.open(donateLink, '_blank')
        }
      }, 500)
    } catch (error) {
      alert(error.message)
    }
  }

  const handleAdClick = (ad) => {
    setAds(ads.map(a => 
      a.id === ad.id ? { ...a, clicks: a.clicks + 1 } : a
    ))
    window.open(ad.url, '_blank')
  }

  return (
    <>
      <button className="ad-manager-btn" onClick={handleAddAd}>
        📢 {getTranslation('addAd', language) || 'Add Ad'}
      </button>

      {showAdModal && (
        <div className="ad-modal-overlay" onClick={() => setShowAdModal(false)}>
          <div className="ad-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="ad-close-btn" onClick={() => setShowAdModal(false)}>
              <X size={24} />
            </button>
            
            <div className="ad-modal-header">
              <AlertCircle size={32} />
              <h2>{getTranslation('addAdvertisement', language) || 'Add Advertisement'}</h2>
              <p>{getTranslation('donationRequired', language) || 'Adding an ad requires a donation link'}</p>
            </div>

            <div className="ad-form">
              <input
                type="url"
                placeholder={getTranslation('adUrl', language) || 'Advertisement URL'}
                value={adUrl}
                onChange={(e) => setAdUrl(e.target.value)}
                className="ad-input"
              />
              <input
                type="url"
                placeholder={getTranslation('adImageUrl', language) || 'Advertisement Image URL'}
                value={adImage}
                onChange={(e) => setAdImage(e.target.value)}
                className="ad-input"
              />
              
              {donateLink && (
                <div className="donation-info">
                  <p>{getTranslation('donationLink', language) || 'Donation Link:'}</p>
                  <a href={donateLink} target="_blank" rel="noopener noreferrer">
                    {donateLink}
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <button className="save-ad-btn" onClick={handleSaveAd}>
                {getTranslation('saveAd', language) || 'Save Ad'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display ads */}
      {ads.length > 0 && (
        <div className="ads-container">
          {ads.map(ad => (
            <div 
              key={ad.id} 
              className="ad-banner"
              onClick={() => handleAdClick(ad)}
            >
              <img src={adImage} alt="Advertisement" />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default AdManager

