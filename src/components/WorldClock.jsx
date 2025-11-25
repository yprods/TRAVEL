import React, { useState, useEffect, useMemo } from 'react'
import { Clock, Sun, Moon, Search, DollarSign, X } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './WorldClock.css'

// Comprehensive country data with timezones, currencies, and coordinates
const countries = [
  { code: 'US', name: 'United States', city: 'New York', tz: 'America/New_York', flag: '🇺🇸', currency: 'USD', lat: 40.7128, lon: -74.0060 },
  { code: 'GB', name: 'United Kingdom', city: 'London', tz: 'Europe/London', flag: '🇬🇧', currency: 'GBP', lat: 51.5074, lon: -0.1278 },
  { code: 'JP', name: 'Japan', city: 'Tokyo', tz: 'Asia/Tokyo', flag: '🇯🇵', currency: 'JPY', lat: 35.6762, lon: 139.6503 },
  { code: 'FR', name: 'France', city: 'Paris', tz: 'Europe/Paris', flag: '🇫🇷', currency: 'EUR', lat: 48.8566, lon: 2.3522 },
  { code: 'AU', name: 'Australia', city: 'Sydney', tz: 'Australia/Sydney', flag: '🇦🇺', currency: 'AUD', lat: -33.8688, lon: 151.2093 },
  { code: 'AE', name: 'United Arab Emirates', city: 'Dubai', tz: 'Asia/Dubai', flag: '🇦🇪', currency: 'AED', lat: 25.2048, lon: 55.2708 },
  { code: 'RU', name: 'Russia', city: 'Moscow', tz: 'Europe/Moscow', flag: '🇷🇺', currency: 'RUB', lat: 55.7558, lon: 37.6173 },
  { code: 'CN', name: 'China', city: 'Beijing', tz: 'Asia/Shanghai', flag: '🇨🇳', currency: 'CNY', lat: 39.9042, lon: 116.4074 },
  { code: 'DE', name: 'Germany', city: 'Berlin', tz: 'Europe/Berlin', flag: '🇩🇪', currency: 'EUR', lat: 52.5200, lon: 13.4050 },
  { code: 'IT', name: 'Italy', city: 'Rome', tz: 'Europe/Rome', flag: '🇮🇹', currency: 'EUR', lat: 41.9028, lon: 12.4964 },
  { code: 'ES', name: 'Spain', city: 'Madrid', tz: 'Europe/Madrid', flag: '🇪🇸', currency: 'EUR', lat: 40.4168, lon: -3.7038 },
  { code: 'BR', name: 'Brazil', city: 'São Paulo', tz: 'America/Sao_Paulo', flag: '🇧🇷', currency: 'BRL', lat: -23.5505, lon: -46.6333 },
  { code: 'IN', name: 'India', city: 'Mumbai', tz: 'Asia/Kolkata', flag: '🇮🇳', currency: 'INR', lat: 19.0760, lon: 72.8777 },
  { code: 'CA', name: 'Canada', city: 'Toronto', tz: 'America/Toronto', flag: '🇨🇦', currency: 'CAD', lat: 43.6532, lon: -79.3832 },
  { code: 'MX', name: 'Mexico', city: 'Mexico City', tz: 'America/Mexico_City', flag: '🇲🇽', currency: 'MXN', lat: 19.4326, lon: -99.1332 },
  { code: 'KR', name: 'South Korea', city: 'Seoul', tz: 'Asia/Seoul', flag: '🇰🇷', currency: 'KRW', lat: 37.5665, lon: 126.9780 },
  { code: 'SG', name: 'Singapore', city: 'Singapore', tz: 'Asia/Singapore', flag: '🇸🇬', currency: 'SGD', lat: 1.3521, lon: 103.8198 },
  { code: 'IL', name: 'Israel', city: 'Tel Aviv', tz: 'Asia/Jerusalem', flag: '🇮🇱', currency: 'ILS', lat: 32.0853, lon: 34.7818 },
  { code: 'SA', name: 'Saudi Arabia', city: 'Riyadh', tz: 'Asia/Riyadh', flag: '🇸🇦', currency: 'SAR', lat: 24.7136, lon: 46.6753 },
  { code: 'ZA', name: 'South Africa', city: 'Johannesburg', tz: 'Africa/Johannesburg', flag: '🇿🇦', currency: 'ZAR', lat: -26.2041, lon: 28.0473 },
  { code: 'AR', name: 'Argentina', city: 'Buenos Aires', tz: 'America/Argentina/Buenos_Aires', flag: '🇦🇷', currency: 'ARS', lat: -34.6037, lon: -58.3816 },
  { code: 'EG', name: 'Egypt', city: 'Cairo', tz: 'Africa/Cairo', flag: '🇪🇬', currency: 'EGP', lat: 30.0444, lon: 31.2357 },
  { code: 'TH', name: 'Thailand', city: 'Bangkok', tz: 'Asia/Bangkok', flag: '🇹🇭', currency: 'THB', lat: 13.7563, lon: 100.5018 },
  { code: 'TR', name: 'Turkey', city: 'Istanbul', tz: 'Europe/Istanbul', flag: '🇹🇷', currency: 'TRY', lat: 41.0082, lon: 28.9784 },
  { code: 'NL', name: 'Netherlands', city: 'Amsterdam', tz: 'Europe/Amsterdam', flag: '🇳🇱', currency: 'EUR', lat: 52.3676, lon: 4.9041 }
]

// Calculate if it's day or night at a location
const isDaytime = (lat, lon) => {
  try {
    const now = new Date()
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
    const localTime = new Date(utc + (lon * 3600000 / 15))
    
    const hours = localTime.getHours()
    const dayOfYear = Math.floor((localTime - new Date(localTime.getFullYear(), 0, 0)) / 86400000)
    const declination = 23.45 * Math.sin((360 * (284 + dayOfYear) / 365) * Math.PI / 180)
    const hourAngle = (hours - 12) * 15
    const altitude = Math.asin(
      Math.sin(lat * Math.PI / 180) * Math.sin(declination * Math.PI / 180) +
      Math.cos(lat * Math.PI / 180) * Math.cos(declination * Math.PI / 180) * Math.cos(hourAngle * Math.PI / 180)
    ) * 180 / Math.PI
    
    return altitude > -6 // Civil twilight
  } catch (error) {
    console.error('Error calculating daytime:', error)
    return true // Default to daytime
  }
}

function WorldClock() {
  const language = useStore((state) => state.language || 'he')
  const selectedDot = useStore((state) => state.selectedDot)
  const [currentTimes, setCurrentTimes] = useState({})
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [currencyRates, setCurrencyRates] = useState({})

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries
    const query = searchQuery.toLowerCase()
    return countries.filter(country => 
      country.name.toLowerCase().includes(query) ||
      country.city.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Get current location from selected dot
  const currentLocation = useMemo(() => {
    if (!selectedDot || !selectedDot.lat || !selectedDot.lon) return null
    
    // Find nearest country
    let nearest = null
    let minDistance = Infinity
    
    countries.forEach(country => {
      const distance = Math.sqrt(
        Math.pow(country.lat - selectedDot.lat, 2) + 
        Math.pow(country.lon - selectedDot.lon, 2)
      )
      if (distance < minDistance) {
        minDistance = distance
        nearest = country
      }
    })
    
    return nearest
  }, [selectedDot])

  // Update times
  useEffect(() => {
    const updateTimes = () => {
      const times = {}
      countries.forEach(({ city, tz }) => {
        try {
          const time = new Date().toLocaleString('en-US', {
            timeZone: tz,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
          })
          times[city] = time
        } catch (error) {
          times[city] = '--:--:--'
        }
      })
      setCurrentTimes(times)
    }

    updateTimes()
    const interval = setInterval(updateTimes, 1000)
    return () => clearInterval(interval)
  }, [])

  // Fetch currency rates (simplified - in production, use a real API)
  useEffect(() => {
    // This is a placeholder - in production, fetch from an API like exchangerate-api.com
    const baseRates = {
      USD: 1, EUR: 0.92, GBP: 0.79, JPY: 150, AUD: 1.52, 
      CAD: 1.35, CNY: 7.24, INR: 83, BRL: 4.95, MXN: 17.05,
      KRW: 1330, SGD: 1.34, ILS: 3.65, AED: 3.67, SAR: 3.75,
      ZAR: 18.85, ARS: 850, EGP: 31, THB: 35.5, TRY: 32.1, RUB: 92
    }
    setCurrencyRates(baseRates)
  }, [])

  const handleCountryClick = (country) => {
    setSelectedCountry(selectedCountry?.code === country.code ? null : country)
  }

  const getCurrencyInfo = (currency) => {
    const rate = currencyRates[currency] || 1
    const baseRate = currencyRates['USD'] || 1
    return {
      code: currency,
      rate: rate,
      toUSD: (1 / rate).toFixed(4),
      fromUSD: rate.toFixed(4)
    }
  }

  return (
    <div className={`world-clock-container ${isExpanded ? 'expanded' : ''}`}>
      <button
        className="world-clock-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Clock size={18} />
        <span>{getTranslation('worldClock', language) || 'World Clock'}</span>
        {currentLocation && (
          <span className="current-location-indicator">
            {isDaytime(currentLocation.lat, currentLocation.lon) ? (
              <Sun size={14} className="day-indicator" />
            ) : (
              <Moon size={14} className="night-indicator" />
            )}
          </span>
        )}
      </button>

      {isExpanded && (
        <div className="world-clock-panel">
          <div className="clock-header">
            <h3>{getTranslation('worldClock', language) || 'World Clocks'}</h3>
            <button className="close-clock-btn" onClick={() => setIsExpanded(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Search filter */}
          <div className="clock-search">
            <Search size={18} />
            <input
              type="text"
              placeholder={getTranslation('searchCountries', language) || 'Search countries...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search" onClick={() => setSearchQuery('')}>
                <X size={16} />
              </button>
            )}
          </div>

          {/* Current location info */}
          {currentLocation && (
            <div className="current-location-card">
              <div className="location-header">
                <span className="location-flag">{currentLocation.flag}</span>
                <div>
                  <div className="location-name">{currentLocation.name}</div>
                  <div className="location-city">{currentLocation.city}</div>
                </div>
                <div className="day-night-indicator">
                  {isDaytime(currentLocation.lat, currentLocation.lon) ? (
                    <>
                      <Sun size={20} className="day-icon" />
                      <span>{getTranslation('daytime', language) || 'Day'}</span>
                    </>
                  ) : (
                    <>
                      <Moon size={20} className="night-icon" />
                      <span>{getTranslation('nighttime', language) || 'Night'}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="location-time">
                {currentTimes[currentLocation.city] || '--:--:--'}
              </div>
              <button 
                className="currency-btn"
                onClick={() => handleCountryClick(currentLocation)}
              >
                <DollarSign size={16} />
                {getTranslation('viewCurrency', language) || 'View Currency'}
              </button>
            </div>
          )}

          {/* Countries list */}
          <div className="clocks-list">
            {filteredCountries.length === 0 ? (
              <div className="no-results">
                {getTranslation('noResults', language) || 'No countries found'}
              </div>
            ) : (
              filteredCountries.map((country) => {
                const isDay = isDaytime(country.lat, country.lon)
                const currencyInfo = getCurrencyInfo(country.currency)
                const isSelected = selectedCountry?.code === country.code

                return (
                  <div 
                    key={country.code} 
                    className={`clock-item ${isSelected ? 'selected' : ''} ${isDay ? 'day' : 'night'}`}
                    onClick={() => handleCountryClick(country)}
                  >
                    <div className="clock-flag">{country.flag}</div>
                    <div className="clock-info">
                      <div className="clock-city">{country.city}</div>
                      <div className="clock-time">{currentTimes[country.city] || '--:--:--'}</div>
                      <div className="clock-country">{country.name}</div>
                    </div>
                    <div className="day-night-badge">
                      {isDay ? (
                        <Sun size={16} className="day-icon" title={getTranslation('daytime', language) || 'Day'} />
                      ) : (
                        <Moon size={16} className="night-icon" title={getTranslation('nighttime', language) || 'Night'} />
                      )}
                    </div>
                    {isSelected && (
                      <div className="currency-info">
                        <div className="currency-header">
                          <DollarSign size={18} />
                          <span>{country.currency}</span>
                        </div>
                        <div className="currency-rates">
                          <div>1 {country.currency} = ${currencyInfo.toUSD} USD</div>
                          <div>1 USD = {currencyInfo.fromUSD} {country.currency}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default WorldClock
