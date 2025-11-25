import React, { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Globe from './components/Globe'
import SearchBar from './components/SearchBar'
import MediaGallery from './components/MediaGallery'
import DotModal from './components/DotModal'
import AdviceModal from './components/AdviceModal'
import LocationPopup from './components/LocationPopup'
import LanguageSelector from './components/LanguageSelector'
import SocialLinks from './components/SocialLinks'
import ThemeToggle from './components/ThemeToggle'
import TravelerControls from './components/TravelerControls'
import Traveler from './components/Traveler'
import TripPlanner from './components/TripPlanner'
import AccessTokenModal from './components/AccessTokenModal'
import ErrorToast from './components/ErrorToast'
import ErrorBoundary from './components/ErrorBoundary'
import AppBar from './components/AppBar'
import SideMenu from './components/SideMenu'
import BottomNav from './components/BottomNav'
import AppFooter from './components/AppFooter'
import AdManager from './components/AdManager'
import WorldClock from './components/WorldClock'
import TravelResources from './components/TravelResources'
import GroupManager from './components/GroupManager'
import ShareButton from './components/ShareButton'
import SignupModal from './components/SignupModal'
import AccessibilityButton from './components/AccessibilityButton'
import FinancialPlanner from './components/FinancialPlanner'
import DisclaimerModal from './components/DisclaimerModal'
import { FloatingParticles } from './components/GameAnimations'
import { useStore } from './store'
import { getTranslation } from './i18n/translations'
import { handleError } from './utils/errorHandler'
import './App.css'

function App() {
  const [showAdviceModal, setShowAdviceModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showFinancialPlanner, setShowFinancialPlanner] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState(null)
  const selectedDot = useStore((state) => state.selectedDot)
  const setSelectedDot = useStore((state) => state.setSelectedDot)
  const user = useStore((state) => state.user)
  const clickLocation = useStore((state) => state.clickLocation)
  const setClickLocation = useStore((state) => state.setClickLocation)
  const loadData = useStore((state) => state.loadData)
  const loading = useStore((state) => state.loading)
  const travelerActive = useStore((state) => state.travelerActive)
  const travelerTarget = useStore((state) => state.travelerTarget)
  const accessToken = useStore((state) => state.accessToken)
  const language = useStore((state) => state.language || 'en')
  const error = useStore((state) => state.error)
  const setError = useStore((state) => state.setError)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [loadData])

  // Check access token and group on mount
  useEffect(() => {
    const hash = window.location.hash.slice(1)
    
    // Check for group link
    if (hash.startsWith('group/')) {
      const groupId = hash.substring(6)
      useStore.getState().setCurrentGroup(groupId)
      // Load group-specific data
    } else if (hash.startsWith('gallery')) {
      // Gallery link - handled by MediaGallery component
    } else if (hash && hash.length >= 64) {
      useStore.getState().setAccessToken(hash)
    } else if (!accessToken) {
      // Show token modal if no token
    }
  }, [])

  // Global error handler
  React.useEffect(() => {
    const handleUnhandledError = (event) => {
      const errorInfo = handleError(event.error, language)
      setError(errorInfo.message)
    }

    const handleRejection = (event) => {
      const errorInfo = handleError(event.reason, language)
      setError(errorInfo.message)
    }

    window.addEventListener('error', handleUnhandledError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleUnhandledError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [language, setError])

  // Listen for signup event from AppBar
  React.useEffect(() => {
    const handleOpenSignup = () => setShowSignupModal(true)
    window.addEventListener('openSignup', handleOpenSignup)
    return () => window.removeEventListener('openSignup', handleOpenSignup)
  }, [])

  return (
    <div className="app">
      <FloatingParticles />
      <DisclaimerModal />
      <ErrorToast error={error} onClose={() => setError(null)} />
      {!accessToken && <AccessTokenModal />}
      
      <AppBar onMenuToggle={() => setMenuOpen(!menuOpen)} menuOpen={menuOpen} />
      <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      
      {/* Hidden components - accessed through menu */}
      <div style={{ display: 'none' }}>
        <SocialLinks />
        <TripPlanner />
        <AdManager />
        <WorldClock />
        <TravelResources />
        <GroupManager />
      </div>
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner">🌍</div>
          <p>Loading the world...</p>
        </div>
      )}
      
      <div className="globe-container">
        <ErrorBoundary>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 50 }}
            gl={{ antialias: true }}
          >
            <React.Suspense fallback={null}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <directionalLight position={[5, 5, 5]} intensity={1} />
              <Globe />
              {travelerActive && travelerTarget && (
                <Traveler targetLocation={travelerTarget} />
              )}
            </React.Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>
      
      <TravelerControls />

      <BottomNav
        onAdviceClick={() => setShowAdviceModal(true)}
        onShareClick={() => {
          if (selectedDot) {
            // Trigger share
            const shareBtn = document.querySelector('.share-button')
            if (shareBtn) shareBtn.click()
          }
        }}
      />

      <AppFooter />
      <AccessibilityButton />

      {showFinancialPlanner && (
        <FinancialPlanner
          trip={selectedTrip}
          onClose={() => {
            setShowFinancialPlanner(false)
            setSelectedTrip(null)
          }}
        />
      )}

      {selectedDot && (
        <DotModal 
          dot={selectedDot} 
          onClose={() => setSelectedDot(null)} 
        />
      )}

      {clickLocation && (
        <LocationPopup
          location={clickLocation}
          onClose={() => setClickLocation(null)}
        />
      )}

      {showAdviceModal && (
        <AdviceModal onClose={() => setShowAdviceModal(false)} />
      )}

      {showSignupModal && (
        <SignupModal
          onClose={() => setShowSignupModal(false)}
          onSwitchToLogin={() => {
            setShowSignupModal(false)
            setShowLoginModal(true)
          }}
        />
      )}

      <MediaGallery />
    </div>
  )
}

export default App

