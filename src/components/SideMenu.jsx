import React, { useState } from 'react'
import { 
  MapPin, Calendar, Users, Globe, Share2, 
  Lightbulb, Settings, X, Clock, Plane, Link as LinkIcon
} from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import TripPlanner from './TripPlanner'
import GroupManager from './GroupManager'
import TravelResources from './TravelResources'
import WorldClock from './WorldClock'
import SocialLinks from './SocialLinks'
import AdManager from './AdManager'
import './SideMenu.css'

function SideMenu({ isOpen, onClose }) {
  const language = useStore((state) => state.language || 'en')
  const [activeSection, setActiveSection] = useState(null)

  const menuItems = [
    {
      id: 'trips',
      icon: Calendar,
      label: getTranslation('tripPlanner', language) || 'Trip Planner',
      component: TripPlanner
    },
    {
      id: 'groups',
      icon: Users,
      label: getTranslation('groups', language) || 'Groups',
      component: GroupManager
    },
    {
      id: 'resources',
      icon: Plane,
      label: getTranslation('travelResources', language) || 'Travel Resources',
      component: TravelResources
    },
    {
      id: 'clock',
      icon: Clock,
      label: getTranslation('worldClock', language) || 'World Clock',
      component: WorldClock
    },
    {
      id: 'social',
      icon: LinkIcon,
      label: getTranslation('socialLinks', language) || 'Social Links',
      component: SocialLinks
    },
    {
      id: 'ads',
      icon: Settings,
      label: getTranslation('adManager', language) || 'Ad Manager',
      component: AdManager
    }
  ]

  const handleItemClick = (item) => {
    if (activeSection === item.id) {
      setActiveSection(null)
    } else {
      setActiveSection(item.id)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="side-menu-overlay" onClick={onClose} />
      <div className={`side-menu ${isOpen ? 'open' : ''}`}>
        <div className="side-menu-header">
          <h2>{getTranslation('menu', language) || 'Menu'}</h2>
          <button className="close-menu-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <nav className="side-menu-nav">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <div key={item.id}>
                <button
                  className={`menu-item ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => handleItemClick(item)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
                {activeSection === item.id && (
                  <div className="menu-item-content">
                    <item.component />
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </div>
    </>
  )
}

export default SideMenu

