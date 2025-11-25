import React, { useState } from 'react'
import { Play, Pause, RotateCcw, MapPin } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './TravelerControls.css'

function TravelerControls() {
  const language = useStore((state) => state.language || 'en')
  const dots = useStore((state) => state.dots)
  const [isActive, setIsActive] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [targetLocation, setTargetLocation] = useState(null)
  const setSelectedDot = useStore((state) => state.setSelectedDot)

  const setTravelerActive = useStore((state) => state.setTravelerActive)
  const setTravelerTarget = useStore((state) => state.setTravelerTarget)

  const startJourney = () => {
    try {
      if (!dots || dots.length === 0) {
        throw new Error(getTranslation('noLocations', language) || 'No locations available')
      }
      if (!dots[0] || !dots[0].position) {
        throw new Error('Invalid location data')
      }
      setIsActive(true)
      setCurrentIndex(0)
      setIsPaused(false)
      setTargetLocation(dots[0])
      setTravelerActive(true)
      setTravelerTarget(dots[0])
    } catch (error) {
      console.error('Error starting journey:', error)
      const setError = useStore.getState().setError
      setError(error.message || 'Failed to start journey')
    }
  }

  const stopJourney = () => {
    setIsActive(false)
    setCurrentIndex(0)
    setTargetLocation(null)
    setTravelerActive(false)
    setTravelerTarget(null)
  }

  const handleArrive = () => {
    try {
      if (!isPaused && currentIndex < dots.length - 1 && dots[currentIndex + 1]) {
        setTimeout(() => {
          try {
            const nextIndex = currentIndex + 1
            if (dots[nextIndex] && dots[nextIndex].position) {
              setCurrentIndex(nextIndex)
              setTargetLocation(dots[nextIndex])
              setSelectedDot(dots[nextIndex])
              setTravelerTarget(dots[nextIndex])
            }
          } catch (error) {
            console.error('Error moving to next location:', error)
          }
        }, 2000) // Wait 2 seconds at each location
      }
    } catch (error) {
      console.error('Error in handleArrive:', error)
    }
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const goToNext = () => {
    try {
      if (currentIndex < dots.length - 1 && dots[currentIndex + 1]) {
        const nextIndex = currentIndex + 1
        if (dots[nextIndex] && dots[nextIndex].position) {
          setCurrentIndex(nextIndex)
          setTargetLocation(dots[nextIndex])
          setSelectedDot(dots[nextIndex])
          setTravelerTarget(dots[nextIndex])
        }
      }
    } catch (error) {
      console.error('Error going to next location:', error)
      const setError = useStore.getState().setError
      setError('Failed to navigate to next location')
    }
  }

  const goToPrevious = () => {
    try {
      if (currentIndex > 0 && dots[currentIndex - 1]) {
        const prevIndex = currentIndex - 1
        if (dots[prevIndex] && dots[prevIndex].position) {
          setCurrentIndex(prevIndex)
          setTargetLocation(dots[prevIndex])
          setSelectedDot(dots[prevIndex])
          setTravelerTarget(dots[prevIndex])
        }
      }
    } catch (error) {
      console.error('Error going to previous location:', error)
      const setError = useStore.getState().setError
      setError('Failed to navigate to previous location')
    }
  }

  if (!isActive) {
    return (
      <div className="traveler-controls">
        <button className="start-journey-btn" onClick={startJourney}>
          <Play size={18} />
          <span>{getTranslation('startJourney', language) || 'Start Journey'}</span>
        </button>
      </div>
    )
  }

  return (
    <div className="traveler-controls active">
      <div className="journey-info">
        <MapPin size={16} />
        <span>
          {currentIndex + 1} / {dots.length}
        </span>
        {targetLocation && (
          <span className="location-name">
            {targetLocation.title || `Location ${currentIndex + 1}`}
          </span>
        )}
      </div>
      <div className="journey-controls">
        <button onClick={goToPrevious} disabled={currentIndex === 0}>
          ←
        </button>
        <button onClick={togglePause}>
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
        </button>
        <button onClick={goToNext} disabled={currentIndex === dots.length - 1}>
          →
        </button>
        <button onClick={stopJourney}>
          <RotateCcw size={18} />
        </button>
      </div>
    </div>
  )
}

export default TravelerControls

