import React, { useState } from 'react'
import { X, Send, Lightbulb } from 'lucide-react'
import { useStore } from '../store'
import './AdviceModal.css'

function AdviceModal({ onClose }) {
  const [advice, setAdvice] = useState('')
  const [author, setAuthor] = useState('')
  const addAdvice = useStore((state) => state.addAdvice)
  const adviceList = useStore((state) => state.adviceList)

  const handleSubmit = () => {
    if (advice.trim()) {
      addAdvice({
        text: advice,
        author: author || 'Anonymous',
        timestamp: new Date().toLocaleString()
      })
      setAdvice('')
      setAuthor('')
    }
  }

  return (
    <div className="advice-modal-overlay" onClick={onClose}>
      <div className="advice-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="advice-close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="advice-header">
          <Lightbulb size={32} />
          <h2>Share Your Travel Advice</h2>
          <p>Help others explore the world with your tips and experiences!</p>
        </div>

        <div className="advice-form">
          <input
            type="text"
            placeholder="Your name (optional)"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="advice-input"
          />
          <textarea
            placeholder="Share your travel advice, tips, or experiences..."
            value={advice}
            onChange={(e) => setAdvice(e.target.value)}
            className="advice-textarea"
            rows="6"
          />
          <button className="advice-submit-btn" onClick={handleSubmit}>
            <Send size={18} />
            Share Advice
          </button>
        </div>

        <div className="advice-list">
          <h3>Community Advice ({adviceList.length})</h3>
          {adviceList.length > 0 ? (
            <div className="advice-items">
              {adviceList.map((item) => (
                <div key={item.id} className="advice-item">
                  <div className="advice-item-header">
                    <strong>{item.author}</strong>
                    <span className="advice-time">{item.timestamp}</span>
                  </div>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-advice">No advice yet. Be the first to share!</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdviceModal

