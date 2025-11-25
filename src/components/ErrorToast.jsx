import React from 'react'
import { X, AlertCircle } from 'lucide-react'
import './ErrorToast.css'

function ErrorToast({ error, onClose }) {
  if (!error) return null

  return (
    <div className="error-toast">
      <AlertCircle size={20} />
      <span className="error-message">{error}</span>
      <button className="error-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  )
}

export default ErrorToast

