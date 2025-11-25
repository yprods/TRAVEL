import React, { useState } from 'react'
import { MapPin, Plus, X, Check } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './TripCreator.css'

function TripCreator({ onClose, onSave }) {
  const language = useStore((state) => state.language || 'en')
  const dots = useStore((state) => state.dots)
  const [tripName, setTripName] = useState('')
  const [tripDescription, setTripDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedLocations, setSelectedLocations] = useState([])

  const toggleLocation = (locationId) => {
    setSelectedLocations(prev => 
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    )
  }

  const handleSave = () => {
    if (!tripName.trim()) {
      alert(getTranslation('tripNameRequired', language) || 'Trip name is required')
      return
    }

    if (selectedLocations.length === 0) {
      alert(getTranslation('selectAtLeastOneLocation', language) || 'Please select at least one location')
      return
    }

    const trip = {
      title: tripName,
      description: tripDescription,
      start_date: startDate,
      end_date: endDate,
      locations: selectedLocations.map(id => dots.find(d => d.id === id))
    }

    onSave(trip)
    onClose()
  }

  return (
    <div className="trip-creator-overlay" onClick={onClose}>
      <div className="trip-creator-content" onClick={(e) => e.stopPropagation()}>
        <button className="trip-creator-close" onClick={onClose}>
          <X size={24} />
        </button>

        <div className="trip-creator-header">
          <MapPin size={32} />
          <h2>{getTranslation('createTripFromGlobe', language) || 'Create Trip from Globe'}</h2>
        </div>

        <div className="trip-creator-form">
          <input
            type="text"
            placeholder={getTranslation('tripTitle', language)}
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            className="trip-input"
          />
          <textarea
            placeholder={getTranslation('tripDescription', language)}
            value={tripDescription}
            onChange={(e) => setTripDescription(e.target.value)}
            className="trip-textarea"
            rows="3"
          />
          <div className="date-inputs">
            <input
              type="date"
              placeholder={getTranslation('startDate', language) || 'Start Date'}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="trip-input"
            />
            <input
              type="date"
              placeholder={getTranslation('endDate', language) || 'End Date'}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="trip-input"
            />
          </div>

          <div className="locations-selector">
            <h3>{getTranslation('selectLocations', language) || 'Select Locations'} ({selectedLocations.length})</h3>
            <div className="locations-list">
              {dots.map((dot) => (
                <div
                  key={dot.id}
                  className={`location-option ${selectedLocations.includes(dot.id) ? 'selected' : ''}`}
                  onClick={() => toggleLocation(dot.id)}
                >
                  <div className="location-option-info">
                    <span className="location-option-title">
                      {dot.title || `Location ${dot.lat.toFixed(2)}, ${dot.lon.toFixed(2)}`}
                    </span>
                    {dot.note && (
                      <span className="location-option-note">{dot.note}</span>
                    )}
                  </div>
                  {selectedLocations.includes(dot.id) && (
                    <Check size={20} className="check-icon" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="save-trip-btn" onClick={handleSave}>
            {getTranslation('createTrip', language) || 'Create Trip'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TripCreator

