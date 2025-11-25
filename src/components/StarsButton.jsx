import React, { useState } from 'react'
import { Star } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './StarsButton.css'

function StarsButton({ locationId }) {
  const language = useStore((state) => state.language || 'en')
  const sendStars = useStore((state) => state.sendStars)
  const getStars = useStore((state) => state.getStars)
  const [showAmountSelector, setShowAmountSelector] = useState(false)
  const [animation, setAnimation] = useState(false)

  const starCount = getStars(locationId)

  const handleSendStars = (amount) => {
    sendStars(locationId, amount)
    setAnimation(true)
    setShowAmountSelector(false)
    setTimeout(() => setAnimation(false), 1000)
  }

  return (
    <div className="stars-container">
      <button
        className={`stars-btn ${animation ? 'animate' : ''}`}
        onClick={() => setShowAmountSelector(!showAmountSelector)}
        title={getTranslation('sendStars', language)}
      >
        <Star size={20} className={starCount > 0 ? 'filled' : ''} />
        <span>{starCount > 0 ? starCount : getTranslation('stars', language)}</span>
      </button>

      {showAmountSelector && (
        <div className="stars-amount-selector">
          <div className="stars-options">
            {[1, 5, 10, 25, 50, 100].map(amount => (
              <button
                key={amount}
                className="star-amount-btn"
                onClick={() => handleSendStars(amount)}
              >
                <Star size={16} />
                <span>{amount}</span>
              </button>
            ))}
          </div>
          <button
            className="close-stars-selector"
            onClick={() => setShowAmountSelector(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

export default StarsButton

