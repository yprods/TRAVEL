import React, { useState } from 'react'
import { Plane, MapPin, Hotel, Car, Utensils, Camera, X } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './TravelResources.css'

const airlines = [
  { name: 'American Airlines', url: 'https://www.aa.com', icon: '✈️' },
  { name: 'Delta Airlines', url: 'https://www.delta.com', icon: '✈️' },
  { name: 'United Airlines', url: 'https://www.united.com', icon: '✈️' },
  { name: 'Lufthansa', url: 'https://www.lufthansa.com', icon: '✈️' },
  { name: 'British Airways', url: 'https://www.britishairways.com', icon: '✈️' },
  { name: 'Air France', url: 'https://www.airfrance.com', icon: '✈️' },
  { name: 'Emirates', url: 'https://www.emirates.com', icon: '✈️' },
  { name: 'Qatar Airways', url: 'https://www.qatarairways.com', icon: '✈️' },
  { name: 'Turkish Airlines', url: 'https://www.turkishairlines.com', icon: '✈️' },
  { name: 'Singapore Airlines', url: 'https://www.singaporeair.com', icon: '✈️' },
  { name: 'Japan Airlines', url: 'https://www.jal.co.jp', icon: '✈️' },
  { name: 'Air Canada', url: 'https://www.aircanada.com', icon: '✈️' },
  { name: 'Qantas', url: 'https://www.qantas.com', icon: '✈️' },
  { name: 'KLM', url: 'https://www.klm.com', icon: '✈️' },
  { name: 'Swiss International', url: 'https://www.swiss.com', icon: '✈️' }
]

const travelSites = [
  { name: 'Booking.com', url: 'https://www.booking.com', category: 'hotels', icon: '🏨' },
  { name: 'Expedia', url: 'https://www.expedia.com', category: 'all', icon: '🌐' },
  { name: 'TripAdvisor', url: 'https://www.tripadvisor.com', category: 'reviews', icon: '⭐' },
  { name: 'Airbnb', url: 'https://www.airbnb.com', category: 'accommodation', icon: '🏠' },
  { name: 'Agoda', url: 'https://www.agoda.com', category: 'hotels', icon: '🏨' },
  { name: 'Hotels.com', url: 'https://www.hotels.com', category: 'hotels', icon: '🏨' },
  { name: 'Kayak', url: 'https://www.kayak.com', category: 'flights', icon: '🔍' },
  { name: 'Skyscanner', url: 'https://www.skyscanner.net', category: 'flights', icon: '✈️' },
  { name: 'Google Flights', url: 'https://www.google.com/flights', category: 'flights', icon: '🔍' },
  { name: 'Hostelworld', url: 'https://www.hostelworld.com', category: 'hostels', icon: '🛏️' },
  { name: 'Viator', url: 'https://www.viator.com', category: 'tours', icon: '🎫' },
  { name: 'GetYourGuide', url: 'https://www.getyourguide.com', category: 'tours', icon: '🎫' },
  { name: 'Rentalcars.com', url: 'https://www.rentalcars.com', category: 'cars', icon: '🚗' },
  { name: 'Hertz', url: 'https://www.hertz.com', category: 'cars', icon: '🚗' },
  { name: 'Avis', url: 'https://www.avis.com', category: 'cars', icon: '🚗' },
  { name: 'Uber', url: 'https://www.uber.com', category: 'transport', icon: '🚕' },
  { name: 'Lonely Planet', url: 'https://www.lonelyplanet.com', category: 'guides', icon: '📖' },
  { name: 'Rick Steves', url: 'https://www.ricksteves.com', category: 'guides', icon: '📖' },
  { name: 'Rome2Rio', url: 'https://www.rome2rio.com', category: 'transport', icon: '🗺️' },
  { name: 'SeatGuru', url: 'https://www.seatguru.com', category: 'flights', icon: '💺' }
]

function TravelResources() {
  const language = useStore((state) => state.language || 'en')
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('airlines')

  return (
    <>
      <button
        className="travel-resources-btn"
        onClick={() => setIsOpen(true)}
      >
        <Plane size={18} />
        <span>{getTranslation('travelResources', language) || 'Travel Resources'}</span>
      </button>

      {isOpen && (
        <>
          <div className="travel-overlay" onClick={() => setIsOpen(false)} />
          <div className="travel-resources-panel">
            <div className="travel-panel-header">
              <h2>{getTranslation('travelResources', language) || 'Travel Resources'}</h2>
              <button className="close-travel-panel" onClick={() => setIsOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="travel-tabs">
              <button
                className={`travel-tab ${activeTab === 'airlines' ? 'active' : ''}`}
                onClick={() => setActiveTab('airlines')}
              >
                <Plane size={16} />
                Airlines
              </button>
              <button
                className={`travel-tab ${activeTab === 'booking' ? 'active' : ''}`}
                onClick={() => setActiveTab('booking')}
              >
                <Hotel size={16} />
                Booking Sites
              </button>
            </div>

            <div className="travel-content">
              {activeTab === 'airlines' && (
                <div className="resources-grid">
                  {airlines.map((airline) => (
                    <a
                      key={airline.name}
                      href={airline.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-item"
                    >
                      <span className="resource-icon">{airline.icon}</span>
                      <span className="resource-name">{airline.name}</span>
                    </a>
                  ))}
                </div>
              )}

              {activeTab === 'booking' && (
                <div className="resources-grid">
                  {travelSites.map((site) => (
                    <a
                      key={site.name}
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="resource-item"
                    >
                      <span className="resource-icon">{site.icon}</span>
                      <span className="resource-name">{site.name}</span>
                      <span className="resource-category">{site.category}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default TravelResources

