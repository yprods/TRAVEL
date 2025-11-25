import React, { useState } from 'react'
import { Share2, Copy, Check, Facebook, Twitter, Linkedin, Mail } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './ShareButton.css'

function ShareButton({ location = null }) {
  const language = useStore((state) => state.language || 'en')
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = location 
    ? `${window.location.origin}${window.location.pathname}#location-${location.id}`
    : window.location.href

  const shareText = location
    ? `Check out this location: ${location.title || 'Amazing place'} on Yprods נסיעות!`
    : 'Explore the world with Yprods נסיעות! 🌍'

  const handleShare = async (platform) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedText = encodeURIComponent(shareText)

    const shareLinks = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      email: `mailto:?subject=${encodeURIComponent('Check out this location!')}&body=${encodedText}%20${encodedUrl}`
    }

    if (shareLinks[platform]) {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: location?.title || 'Yprods נסיעות',
          text: shareText,
          url: shareUrl
        })
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="share-button-container">
      <button
        className="share-button"
        onClick={() => setShowShareMenu(!showShareMenu)}
      >
        <Share2 size={18} />
        <span>{getTranslation('share', language)}</span>
      </button>

      {showShareMenu && (
        <>
          <div className="share-overlay" onClick={() => setShowShareMenu(false)} />
          <div className="share-menu">
            <div className="share-menu-header">
              <h3>{getTranslation('share', language)}</h3>
            </div>
            
            <div className="share-options">
              {navigator.share && (
                <button
                  className="share-option native"
                  onClick={handleNativeShare}
                >
                  <Share2 size={20} />
                  <span>{getTranslation('shareVia', language) || 'Share Via...'}</span>
                </button>
              )}
              
              <button
                className="share-option facebook"
                onClick={() => handleShare('facebook')}
              >
                <Facebook size={20} />
                <span>Facebook</span>
              </button>
              
              <button
                className="share-option twitter"
                onClick={() => handleShare('twitter')}
              >
                <Twitter size={20} />
                <span>Twitter</span>
              </button>
              
              <button
                className="share-option linkedin"
                onClick={() => handleShare('linkedin')}
              >
                <Linkedin size={20} />
                <span>LinkedIn</span>
              </button>
              
              <button
                className="share-option email"
                onClick={() => handleShare('email')}
              >
                <Mail size={20} />
                <span>{getTranslation('email', language) || 'Email'}</span>
              </button>
              
              <button
                className="share-option copy"
                onClick={handleCopyLink}
              >
                {copied ? <Check size={20} /> : <Copy size={20} />}
                <span>{copied ? getTranslation('copied', language) || 'Copied!' : getTranslation('copyLink', language) || 'Copy Link'}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default ShareButton

