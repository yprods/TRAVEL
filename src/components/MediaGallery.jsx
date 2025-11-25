import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Share2 } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './MediaGallery.css'

function MediaGallery() {
  const language = useStore((state) => state.language || 'en')
  const dots = useStore((state) => state.dots)
  const searchQuery = useStore((state) => state.searchQuery)
  const setSelectedDot = useStore((state) => state.setSelectedDot)
  const [isOpen, setIsOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [shareLink, setShareLink] = useState('')

  const allMedia = dots
    .filter(dot => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        dot.title?.toLowerCase().includes(query) ||
        dot.note?.toLowerCase().includes(query)
      )
    })
    .flatMap(dot => 
      (dot.media || []).map(item => ({ ...item, dot }))
    )

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allMedia.length)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length)
  }

  const handleShareGallery = () => {
    const galleryLink = `${window.location.origin}${window.location.pathname}#gallery`
    navigator.clipboard.writeText(galleryLink)
    setShareLink(galleryLink)
    setTimeout(() => setShareLink(''), 3000)
  }

  // Check if opened from shared link
  useEffect(() => {
    const hash = window.location.hash
    if (hash.startsWith('#gallery')) {
      setIsOpen(true)
      const params = new URLSearchParams(hash.substring(9))
      const locationId = params.get('location')
      if (locationId && allMedia.length > 0) {
        const mediaIndex = allMedia.findIndex(m => m.dot.id === parseInt(locationId))
        if (mediaIndex >= 0) {
          setCurrentIndex(mediaIndex)
        }
      }
    }
  }, [dots, allMedia])

  if (allMedia.length === 0) return null

  return (
    <>
      <button
        className="gallery-toggle"
        onClick={() => setIsOpen(true)}
      >
        📸 Gallery ({allMedia.length})
      </button>

      {isOpen && (
        <div className="gallery-overlay" onClick={() => setIsOpen(false)}>
          <div className="gallery-container" onClick={(e) => e.stopPropagation()}>
            <button className="gallery-close" onClick={() => setIsOpen(false)}>
              <X size={24} />
            </button>

            <div className="gallery-header">
              <h2>{getTranslation('mediaGallery', language)}</h2>
              <div className="gallery-header-actions">
                <p>{currentIndex + 1} of {allMedia.length}</p>
                <button
                  className="share-gallery-btn"
                  onClick={handleShareGallery}
                  title={getTranslation('shareGallery', language) || 'Share Gallery'}
                >
                  <Share2 size={18} />
                  {shareLink && <span className="shared-indicator">✓ {getTranslation('copied', language)}</span>}
                </button>
              </div>
            </div>

            <div className="gallery-main">
              <button className="gallery-nav prev" onClick={handlePrev}>
                <ChevronLeft size={32} />
              </button>

              <div className="gallery-media">
                {allMedia[currentIndex] && (
                  <>
                    {allMedia[currentIndex].type === 'image' ? (
                      <img
                        src={allMedia[currentIndex].url}
                        alt={allMedia[currentIndex].name}
                      />
                    ) : (
                      <video
                        src={allMedia[currentIndex].url}
                        controls
                        autoPlay
                      />
                    )}
                    <div className="gallery-info">
                      <h3>{allMedia[currentIndex].dot.title || 'Untitled Location'}</h3>
                      <p>{allMedia[currentIndex].dot.note}</p>
                      <button
                        className="view-location-btn"
                        onClick={() => {
                          setSelectedDot(allMedia[currentIndex].dot)
                          setIsOpen(false)
                        }}
                      >
                        View Location Details
                      </button>
                    </div>
                  </>
                )}
              </div>

              <button className="gallery-nav next" onClick={handleNext}>
                <ChevronRight size={32} />
              </button>
            </div>

            <div className="gallery-thumbnails">
              {allMedia.map((item, index) => (
                <div
                  key={item.id}
                  className={`thumbnail ${index === currentIndex ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} />
                  ) : (
                    <video src={item.url} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default MediaGallery

