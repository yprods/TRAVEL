import React from 'react'
import './GameAnimations.css'

// SVG Icons and Animations
export const StarIcon = ({ className = '' }) => (
  <svg className={`star-icon ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
          fill="currentColor" 
          stroke="currentColor" 
          strokeWidth="2"/>
  </svg>
)

export const GlobeIcon = ({ className = '' }) => (
  <svg className={`globe-icon ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M2 12H22M12 2C15.5 6.5 17 9.5 17 12C17 14.5 15.5 17.5 12 22C8.5 17.5 7 14.5 7 12C7 9.5 8.5 6.5 12 2Z" 
          stroke="currentColor" 
          strokeWidth="2"/>
  </svg>
)

export const LocationPin = ({ className = '' }) => (
  <svg className={`location-pin ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
          fill="currentColor"/>
    <circle cx="12" cy="9" r="3" fill="white"/>
  </svg>
)

export const HeartIcon = ({ className = '' }) => (
  <svg className={`heart-icon ${className}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.84 4.61C20.33 4.1 19.72 3.7 19.05 3.43C18.38 3.16 17.67 3 16.95 3C16.23 3 15.52 3.16 14.85 3.43C14.18 3.7 13.57 4.1 13.06 4.61L12 5.67L10.94 4.61C9.92 3.59 8.58 3 7.05 3C5.52 3 4.18 3.59 3.16 4.61C2.14 5.63 1.55 6.97 1.55 8.5C1.55 10.03 2.14 11.37 3.16 12.39L4.22 13.45L12 21.23L19.78 13.45L20.84 12.39C21.35 11.88 21.75 11.27 22.02 10.6C22.29 9.93 22.45 9.22 22.45 8.5C22.45 7.78 22.29 7.07 22.02 6.4C21.75 5.73 21.35 5.12 20.84 4.61Z" 
          fill="currentColor" 
          stroke="currentColor" 
          strokeWidth="2"/>
  </svg>
)

export const SparkleAnimation = () => (
  <div className="sparkle-container">
    {[...Array(5)].map((_, i) => (
      <div key={i} className={`sparkle sparkle-${i}`}>
        <StarIcon />
      </div>
    ))}
  </div>
)

export const FloatingParticles = () => (
  <div className="particles-container">
    {[...Array(20)].map((_, i) => (
      <div key={i} className={`particle particle-${i}`}>
        <div className="particle-dot" />
      </div>
    ))}
  </div>
)

export const PulseRing = ({ delay = 0 }) => (
  <div className="pulse-ring" style={{ animationDelay: `${delay}s` }} />
)

export const BounceAnimation = ({ children }) => (
  <div className="bounce-animation">
    {children}
  </div>
)

export const RotateAnimation = ({ children }) => (
  <div className="rotate-animation">
    {children}
  </div>
)

