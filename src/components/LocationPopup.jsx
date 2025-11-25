import React from 'react'
import { X, MapPin, Heart, MessageCircle, Share2, Image as ImageIcon } from 'lucide-react'
import { useStore } from '../store'
import './LocationPopup.css'

function LocationPopup({ location, onClose }) {
  const setSelectedDot = useStore((state) => state.setSelectedDot)

  const handleViewLocation = (dot) => {
    setSelectedDot(dot)
    onClose()
  }

  if (!location || !location.locations || location.locations.length === 0) {
    return null
  }

  return (
    <div className="location-popup-overlay" onClick={onClose}>
      <div className="location-popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="popup-header">
          <MapPin size={24} />
          <div>
            <h2>Locations Nearby</h2>
            <p className="popup-coordinates">
              {location.lat.toFixed(4)}°N, {location.lon.toFixed(4)}°E
            </p>
            <p className="popup-count">
              {location.locations.length} {location.locations.length === 1 ? 'location' : 'locations'} found
            </p>
          </div>
        </div>

        <div className="popup-locations-list">
          {location.locations.map((loc) => (
            <div key={loc.id} className="popup-location-item">
              <div className="location-item-header">
                <h3>{loc.title || `Location ${loc.lat.toFixed(2)}, ${loc.lon.toFixed(2)}`}</h3>
                <button
                  className="view-location-btn-small"
                  onClick={() => handleViewLocation(loc)}
                >
                  View Details
                </button>
              </div>
              
              {loc.note && (
                <p className="location-note">{loc.note}</p>
              )}

              <div className="location-stats">
                {loc.media && loc.media.length > 0 && (
                  <span className="stat-item">
                    <ImageIcon size={14} />
                    {loc.media.length}
                  </span>
                )}
                {loc.likes > 0 && (
                  <span className="stat-item">
                    <Heart size={14} />
                    {loc.likes}
                  </span>
                )}
                {loc.comments && loc.comments.length > 0 && (
                  <span className="stat-item">
                    <MessageCircle size={14} />
                    {loc.comments.length}
                  </span>
                )}
                {loc.shares > 0 && (
                  <span className="stat-item">
                    <Share2 size={14} />
                    {loc.shares}
                  </span>
                )}
              </div>

              {loc.media && loc.media.length > 0 && (
                <div className="location-media-preview">
                  {loc.media.slice(0, 3).map((media) => (
                    <div key={media.id} className="media-preview-thumb">
                      {media.type === 'image' ? (
                        <img src={`http://localhost:5000${media.url}`} alt={media.name} />
                      ) : (
                        <video src={`http://localhost:5000${media.url}`} />
                      )}
                    </div>
                  ))}
                  {loc.media.length > 3 && (
                    <div className="media-more">+{loc.media.length - 3}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LocationPopup

