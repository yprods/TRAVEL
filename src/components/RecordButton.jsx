import React, { useState, useRef } from 'react'
import { Mic, Video, Square } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './RecordButton.css'

function RecordButton({ locationId, onRecordComplete }) {
  const language = useStore((state) => state.language || 'en')
  const [isRecording, setIsRecording] = useState(false)
  const [recordType, setRecordType] = useState(null) // 'audio' or 'video'
  const [showTypeSelector, setShowTypeSelector] = useState(false)
  const mediaRecorderRef = useRef(null)
  const streamRef = useRef(null)
  const chunksRef = useRef([])

  const startRecording = async (type) => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media recording is not supported in this browser')
      }
      
      const stream = type === 'audio'
        ? await navigator.mediaDevices.getUserMedia({ audio: true })
        : await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      
      streamRef.current = stream
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: type === 'audio' ? 'audio/webm' : 'video/webm' })
        const file = new File([blob], `${type}-${Date.now()}.webm`, { type: blob.type })
        
        if (onRecordComplete) {
          onRecordComplete(file, type)
        }
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordType(type)
      setShowTypeSelector(false)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert(getTranslation('recordingError', language) || 'Error accessing microphone/camera')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordType(null)
    }
  }

  return (
    <div className="record-button-container">
      {!isRecording ? (
        <>
          {!showTypeSelector ? (
            <button
              className="record-btn"
              onClick={() => setShowTypeSelector(true)}
            >
              <Mic size={18} />
              <span>{getTranslation('record', language) || 'Record'}</span>
            </button>
          ) : (
            <div className="record-type-selector">
              <button
                className="record-type-btn audio"
                onClick={() => startRecording('audio')}
              >
                <Mic size={20} />
                <span>{getTranslation('recordAudio', language) || 'Audio'}</span>
              </button>
              <button
                className="record-type-btn video"
                onClick={() => startRecording('video')}
              >
                <Video size={20} />
                <span>{getTranslation('recordVideo', language) || 'Video'}</span>
              </button>
              <button
                className="cancel-record-btn"
                onClick={() => setShowTypeSelector(false)}
              >
                ✕
              </button>
            </div>
          )}
        </>
      ) : (
        <button
          className="record-btn recording"
          onClick={stopRecording}
        >
          <Square size={18} />
          <span>{getTranslation('stopRecording', language) || 'Stop'}</span>
          <span className="recording-indicator"></span>
        </button>
      )}
    </div>
  )
}

export default RecordButton

