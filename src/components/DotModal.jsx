import React, { useState, useRef } from 'react'
import { X, Send, Image as ImageIcon, Video, FileText, ThumbsDown, Share2 } from 'lucide-react'
import { useStore } from '../store'
import { api } from '../api/client'
import StarsButton from './StarsButton'
import RecordButton from './RecordButton'
import { HeartIcon } from './GameAnimations'
import { getTranslation } from '../i18n/translations'
import { handleError } from '../utils/errorHandler'
import ShareButton from './ShareButton'
import './DotModal.css'

function DotModal({ dot, onClose }) {
  const [commentText, setCommentText] = useState('')
  const [mediaFiles, setMediaFiles] = useState(dot.media || [])
  const fileInputRef = useRef(null)
  const addComment = useStore((state) => state.addComment)
  const toggleLike = useStore((state) => state.toggleLike)
  const toggleDislike = useStore((state) => state.toggleDislike)
  const incrementShare = useStore((state) => state.incrementShare)
  const updateDot = useStore((state) => state.updateDot)
  const uploadMedia = useStore((state) => state.uploadMedia)
  const language = useStore((state) => state.language || 'he')
  const setError = useStore((state) => state.setError)
  const [visitorName, setVisitorName] = useState('')
  const [showCheckIn, setShowCheckIn] = useState(false)

  const handleAddMedia = (e) => {
    const files = Array.from(e.target.files)
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      name: file.name
    }))
    setMediaFiles([...mediaFiles, ...newMedia])
    updateDot(dot.id, { media: [...mediaFiles, ...newMedia] })
  }

  const handleComment = async () => {
    try {
      if (!commentText.trim()) return
      
      if (commentText.length > 1000) {
        setError(getTranslation('commentTooLong', language) || 'Comment is too long (max 1000 characters)')
        return
      }
      
      await addComment(dot.id, {
        text: commentText.trim(),
        author: 'You',
        timestamp: new Date().toLocaleString()
      })
      setCommentText('')
    } catch (error) {
      console.error('Error adding comment:', error)
      const errorInfo = handleError(error, language)
      setError(errorInfo.message)
    }
  }

  const handleShare = async () => {
    try {
      const shareData = {
        title: dot.title || 'Location on Globe',
        text: dot.note || 'Check out this location!',
        url: window.location.href
      }
      
      if (navigator.share) {
        await navigator.share(shareData)
        incrementShare(dot.id)
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href)
        incrementShare(dot.id)
        alert(getTranslation('linkCopied', language) || 'Link copied to clipboard!')
      } else {
        // Fallback: select text
        const textArea = document.createElement('textarea')
        textArea.value = window.location.href
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        incrementShare(dot.id)
        alert(getTranslation('linkCopied', language) || 'Link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
      if (error.name !== 'AbortError') {
        setError(getTranslation('shareFailed', language) || 'Failed to share location')
      }
    }
  }

  if (dot.isNew) {
    return <NewDotModal dot={dot} onClose={onClose} />
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>{dot.title || `Location (${dot.lat.toFixed(2)}, ${dot.lon.toFixed(2)})`}</h2>
          <p className="coordinates">
            Lat: {dot.lat.toFixed(4)}° | Lon: {dot.lon.toFixed(4)}°
          </p>
          {dot.visitors !== undefined && (
            <p className="visitor-count">
              👥 {getTranslation('visitors', language) || 'Visitors'}: {dot.visitors || 0}
            </p>
          )}
        </div>

        {dot.note && (
          <div className="note-section">
            <FileText size={20} />
            <p>{dot.note}</p>
          </div>
        )}

        <div className="media-section">
          <div className="media-header">
            <h3>Media Gallery</h3>
            <button
              className="add-media-btn"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon size={18} />
              Add Media
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleAddMedia}
            style={{ display: 'none' }}
          />
          
          {mediaFiles.length > 0 ? (
            <div className="media-grid">
              {mediaFiles.map((item) => (
                <div key={item.id} className="media-item">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} />
                  ) : (
                    <video src={item.url} controls />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-media">No media yet. Add some photos or videos!</p>
          )}
        </div>

        <div className="social-actions">
          <button
            className="action-btn like"
            onClick={() => toggleLike(dot.id)}
          >
            <HeartIcon className="heart-icon-small" />
            <span>{dot.likes || 0}</span>
          </button>
          <button
            className="action-btn dislike"
            onClick={() => toggleDislike(dot.id)}
          >
            <ThumbsDown size={20} />
            <span>{dot.dislikes || 0}</span>
          </button>
          <button
            className="action-btn share"
            onClick={handleShare}
          >
            <Share2 size={20} />
            <span>{dot.shares || 0}</span>
          </button>
        </div>

        <div className="visitor-section">
          <div className="visitor-header">
            <h3>👥 {getTranslation('visitors', language) || 'Visitors'}: {dot.visitors || 0}</h3>
            <button
              className="checkin-btn"
              onClick={() => setShowCheckIn(true)}
            >
              {getTranslation('checkIn', language) || 'Check In'}
            </button>
          </div>
          {showCheckIn && (
            <div className="checkin-form">
              <input
                type="text"
                placeholder={getTranslation('yourName', language) || 'Your Name (optional)'}
                value={visitorName}
                onChange={(e) => setVisitorName(e.target.value)}
                className="visitor-input"
              />
              <div className="checkin-actions">
                <button
                  className="confirm-checkin-btn"
                  onClick={async () => {
                    try {
                      const result = await api.checkIn(dot.id, visitorName)
                      const location = await api.getLocation(dot.id)
                      setMediaFiles(location.media || [])
                      setShowCheckIn(false)
                      setVisitorName('')
                      // Update dot in store
                      useStore.getState().updateDot(dot.id, { visitors: result.visitors })
                    } catch (error) {
                      const errorInfo = handleError(error, language)
                      useStore.getState().setError(errorInfo.message)
                    }
                  }}
                >
                  {getTranslation('confirm', language) || 'Confirm'}
                </button>
                <button
                  className="cancel-checkin-btn"
                  onClick={() => {
                    setShowCheckIn(false)
                    setVisitorName('')
                  }}
                >
                  {getTranslation('cancel', language)}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="comments-section">
          <h3>Comments ({dot.comments?.length || 0})</h3>
          <div className="comments-list">
            {dot.comments?.map((comment) => (
              <div key={comment.id} className="comment">
                <strong>{comment.author}:</strong>
                <p>{comment.text}</p>
                <span className="comment-time">{comment.timestamp}</span>
              </div>
            ))}
          </div>
          <div className="comment-input">
            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleComment()}
            />
            <button onClick={handleComment}>
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewDotModal({ dot, onClose }) {
  const [title, setTitle] = useState('')
  const [note, setNote] = useState('')
  const [mediaFiles, setMediaFiles] = useState([])
  const fileInputRef = useRef(null)
  const addDot = useStore((state) => state.addDot)
  const setSelectedDot = useStore((state) => state.setSelectedDot)

  const handleSave = () => {
    if (title.trim() || note.trim()) {
      addDot({
        ...dot,
        title: title || `Location ${dot.lat.toFixed(2)}, ${dot.lon.toFixed(2)}`,
        note,
        media: mediaFiles
      })
      setSelectedDot(null)
      onClose()
    }
  }

  const handleAddMedia = (e) => {
    const files = Array.from(e.target.files)
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      name: file.name
    }))
    setMediaFiles([...mediaFiles, ...newMedia])
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="modal-header">
          <h2>Add New Location</h2>
          <p className="coordinates">
            Lat: {dot.lat.toFixed(4)}° | Lon: {dot.lon.toFixed(4)}°
          </p>
        </div>

        <div className="form-section">
          <input
            type="text"
            placeholder="Location Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-input"
          />
          <textarea
            placeholder="Add a note about this location..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="form-textarea"
            rows="4"
          />
          
          <button
            className="add-media-btn"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon size={18} />
            Add Photos/Videos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleAddMedia}
            style={{ display: 'none' }}
          />

          {mediaFiles.length > 0 && (
            <div className="media-preview">
              {mediaFiles.map((item) => (
                <div key={item.id} className="media-preview-item">
                  {item.type === 'image' ? (
                    <img src={item.url} alt={item.name} />
                  ) : (
                    <video src={item.url} />
                  )}
                </div>
              ))}
            </div>
          )}

          <button className="save-btn" onClick={handleSave}>
            Save Location
          </button>
        </div>
      </div>
    </div>
  )
}

export default DotModal

