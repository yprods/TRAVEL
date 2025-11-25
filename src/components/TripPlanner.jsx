import React, { useState } from 'react'
import { MapPin, Calendar, Users, MessageSquare, Image as ImageIcon, Video, Plus, X } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import TripCreator from './TripCreator'
import StarsButton from './StarsButton'
import './TripPlanner.css'

function TripPlanner() {
  const language = useStore((state) => state.language || 'en')
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showTripCreator, setShowTripCreator] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [trips, setTrips] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    locations: []
  })

  const loadTrips = async () => {
    try {
      const response = await fetch('/api/trips')
      const data = await response.json()
      setTrips(data)
    } catch (error) {
      console.error('Error loading trips:', error)
    }
  }

  React.useEffect(() => {
    if (isOpen) {
      loadTrips()
    }
  }, [isOpen])

  const handleCreateTrip = async () => {
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          author: 'You',
          locations: JSON.stringify(formData.locations)
        })
      })
      const trip = await response.json()
      setTrips([trip, ...trips])
      setShowCreateForm(false)
      setFormData({ title: '', description: '', start_date: '', end_date: '', locations: [] })
    } catch (error) {
      console.error('Error creating trip:', error)
      alert('Failed to create trip plan')
    }
  }

  const handleCreateRequest = async (tripId, type, locationId = null) => {
    const message = prompt(getTranslation('enterRequestMessage', language) || 'Enter your request message:')
    if (!message) return

    try {
      await fetch(`/api/trips/${tripId}/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_type: type,
          location_id: locationId,
          message,
          author: 'You'
        })
      })
      if (selectedTrip) {
        const response = await fetch(`/api/trips/${selectedTrip.id}`)
        const trip = await response.json()
        setSelectedTrip(trip)
      }
    } catch (error) {
      console.error('Error creating request:', error)
    }
  }

  return (
    <div className="trip-planner-container">
      <button
        className="trip-planner-btn"
        onClick={() => {
          setIsOpen(!isOpen)
          if (!isOpen) loadTrips()
        }}
      >
        <MapPin size={18} />
        <span>{getTranslation('tripPlanner', language) || 'Trip Planner'}</span>
      </button>

      {isOpen && (
        <>
          <div className="trip-overlay" onClick={() => setIsOpen(false)} />
          <div className="trip-panel">
            <div className="trip-panel-header">
              <h2>{getTranslation('tripPlanner', language) || 'Trip Planner'}</h2>
              <button className="close-trip-panel" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            {!selectedTrip ? (
              <>
                <div className="trip-creation-options">
                  <button
                    className="create-trip-btn"
                    onClick={() => setShowCreateForm(true)}
                  >
                    <Plus size={18} />
                    {getTranslation('createTripPlan', language) || 'Create Trip Plan'}
                  </button>
                  <button
                    className="create-trip-from-globe-btn"
                    onClick={() => setShowTripCreator(true)}
                  >
                    <MapPin size={18} />
                    {getTranslation('createTripFromGlobe', language) || 'Create from Globe'}
                  </button>
                </div>

                {showCreateForm && (
                  <div className="create-trip-form">
                    <input
                      type="text"
                      placeholder={getTranslation('tripTitle', language) || 'Trip Title'}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="form-input"
                    />
                    <textarea
                      placeholder={getTranslation('tripDescription', language) || 'Trip Description'}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="form-textarea"
                      rows="4"
                    />
                    <div className="date-inputs">
                      <input
                        type="date"
                        placeholder="Start Date"
                        value={formData.start_date}
                        onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                        className="form-input"
                      />
                      <input
                        type="date"
                        placeholder="End Date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div className="form-actions">
                      <button onClick={handleCreateTrip} className="save-btn">
                        {getTranslation('create', language) || 'Create'}
                      </button>
                      <button onClick={() => setShowCreateForm(false)} className="cancel-btn">
                        {getTranslation('cancel', language)}
                      </button>
                    </div>
                  </div>
                )}

                <div className="trips-list">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="trip-item"
                      onClick={() => {
                        fetch(`/api/trips/${trip.id}`)
                          .then(res => res.json())
                          .then(data => setSelectedTrip(data))
                      }}
                    >
                      <h3>{trip.title}</h3>
                      <p className="trip-meta">
                        <Calendar size={14} />
                        {trip.start_date && trip.end_date 
                          ? `${trip.start_date} - ${trip.end_date}`
                          : 'No dates set'}
                      </p>
                      {trip.description && <p className="trip-description">{trip.description}</p>}
                    </div>
                  ))}
                </div>
              </>
            ) : showTripCreator ? (
              <TripCreator
                onClose={() => setShowTripCreator(false)}
                onSave={async (trip) => {
                  try {
                    const response = await fetch('/api/trips', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        ...trip,
                        locations: JSON.stringify(trip.locations.map(l => l.id)),
                        author: 'You'
                      })
                    })
                    const newTrip = await response.json()
                    setTrips([newTrip, ...trips])
                    setShowTripCreator(false)
                  } catch (error) {
                    console.error('Error creating trip:', error)
                    alert('Failed to create trip')
                  }
                }}
              />
            ) : (
              <div className="trip-detail">
                <button
                  className="back-btn"
                  onClick={() => setSelectedTrip(null)}
                >
                  ← Back
                </button>
                <h2>{selectedTrip.title}</h2>
                {selectedTrip.description && <p>{selectedTrip.description}</p>}
                
                <div className="trip-actions">
                  <button
                    className="request-btn"
                    onClick={() => handleCreateRequest(selectedTrip.id, 'advice')}
                  >
                    <MessageSquare size={16} />
                    {getTranslation('askForAdvice', language) || 'Ask for Advice'}
                  </button>
                  <button
                    className="request-btn"
                    onClick={() => handleCreateRequest(selectedTrip.id, 'media')}
                  >
                    <ImageIcon size={16} />
                    {getTranslation('askForMedia', language) || 'Ask for Media'}
                  </button>
                  <button
                    className="request-btn"
                    onClick={() => handleCreateRequest(selectedTrip.id, 'posts')}
                  >
                    <Users size={16} />
                    {getTranslation('askForPosts', language) || 'Ask for Posts'}
                  </button>
                </div>

                <div className="requests-section">
                  <h3>{getTranslation('requests', language) || 'Requests'}</h3>
                  {selectedTrip.requests?.map((request) => (
                    <div key={request.id} className="request-item">
                      <div className="request-header">
                        <span className="request-type">{request.request_type}</span>
                        <span className="request-author">{request.author}</span>
                      </div>
                      <p className="request-message">{request.message}</p>
                      {request.responses?.length > 0 && (
                        <div className="responses">
                          {request.responses.map((response) => (
                            <div key={response.id} className="response-item">
                              <strong>{response.author}:</strong> {response.content}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default TripPlanner

