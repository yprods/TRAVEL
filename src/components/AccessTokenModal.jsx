import React, { useState, useEffect } from 'react'
import { Lock, Copy, Check } from 'lucide-react'
import { useStore } from '../store'
import './AccessTokenModal.css'

function AccessTokenModal() {
  const accessToken = useStore((state) => state.accessToken)
  const generateAccessToken = useStore((state) => state.generateAccessToken)
  const setAccessToken = useStore((state) => state.setAccessToken)
  const [tokenInput, setTokenInput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!accessToken) {
      const newToken = generateAccessToken()
      setTokenInput(newToken)
    } else {
      setTokenInput(accessToken)
    }
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(tokenInput)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSubmit = () => {
    if (tokenInput.length < 64) {
      setError('Token must be at least 64 characters')
      return
    }
    setAccessToken(tokenInput)
    setError('')
  }

  const handleGenerateNew = () => {
    const newToken = generateAccessToken()
    setTokenInput(newToken)
    setError('')
  }

  if (accessToken && window.location.hash !== `#${accessToken}`) {
    return null
  }

  return (
    <div className="access-token-overlay">
      <div className="access-token-modal">
        <div className="token-header">
          <Lock size={32} />
          <h2>Secure Access Token</h2>
          <p>This is your unique access token. Save it securely!</p>
        </div>

        <div className="token-content">
          <div className="token-input-group">
            <label>Your Access Token:</label>
            <div className="token-display">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  setTokenInput(e.target.value)
                  setError('')
                }}
                className="token-input"
                placeholder="Enter or generate token..."
              />
              <button
                className="copy-btn"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            {error && <p className="token-error">{error}</p>}
          </div>

          <div className="token-actions">
            <button
              className="generate-btn"
              onClick={handleGenerateNew}
            >
              🔄 Generate New Token
            </button>
            <button
              className="submit-btn"
              onClick={handleSubmit}
            >
              ✓ Save Token
            </button>
          </div>

          <div className="token-info">
            <p>⚠️ <strong>Important:</strong></p>
            <ul>
              <li>Save this token in a secure place</li>
              <li>You'll need it to access the app</li>
              <li>Add it to your URL: <code>#YOUR_TOKEN</code></li>
              <li>Don't share it with others</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccessTokenModal

