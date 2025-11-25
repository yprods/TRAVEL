import React, { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { useStore } from '../store'
import { getTranslation } from '../i18n/translations'
import './SearchBar.css'

function SearchBar() {
  const language = useStore((state) => state.language || 'en')
  const [searchValue, setSearchValue] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const setSearchQuery = useStore((state) => state.setSearchQuery)
  const searchFilters = useStore((state) => state.searchFilters)
  const setSearchFilters = useStore((state) => state.setSearchFilters)
  const dots = useStore((state) => state.dots)

  const handleSearch = (e) => {
    const value = e.target.value
    setSearchValue(value)
    setSearchQuery(value)
  }

  const filteredDots = dots.filter(dot => {
    const matchesSearch = !searchValue || 
      dot.title?.toLowerCase().includes(searchValue.toLowerCase()) ||
      dot.note?.toLowerCase().includes(searchValue.toLowerCase())
    
    const matchesMedia = !searchFilters.hasMedia || (dot.media && dot.media.length > 0)
    const matchesComments = !searchFilters.hasComments || (dot.comments && dot.comments.length > 0)
    const matchesLikes = dot.likes >= (searchFilters.minLikes || 0)
    
    return matchesSearch && matchesMedia && matchesComments && matchesLikes
  })

  return (
    <div className="search-container">
      <div className="search-bar">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          placeholder={getTranslation('search', language)}
          value={searchValue}
          onChange={handleSearch}
          className="search-input"
        />
        <button
          className="filter-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
        </button>
        {searchValue && (
          <span className="search-results">{filteredDots.length} results</span>
        )}
      </div>

      {showFilters && (
        <div className="search-filters">
          <div className="filter-item">
            <label>
              <input
                type="checkbox"
                checked={searchFilters.hasMedia}
                onChange={(e) => setSearchFilters({ hasMedia: e.target.checked })}
              />
              {getTranslation('hasMedia', language) || 'Has Media'}
            </label>
          </div>
          <div className="filter-item">
            <label>
              <input
                type="checkbox"
                checked={searchFilters.hasComments}
                onChange={(e) => setSearchFilters({ hasComments: e.target.checked })}
              />
              {getTranslation('hasComments', language) || 'Has Comments'}
            </label>
          </div>
          <div className="filter-item">
            <label>
              {getTranslation('minLikes', language) || 'Min Likes'}:
              <input
                type="number"
                min="0"
                value={searchFilters.minLikes || 0}
                onChange={(e) => setSearchFilters({ minLikes: parseInt(e.target.value) || 0 })}
                className="filter-input"
              />
            </label>
          </div>
          <button
            className="clear-filters-btn"
            onClick={() => setSearchFilters({ hasMedia: false, hasComments: false, minLikes: 0 })}
          >
            <X size={14} />
            {getTranslation('clearFilters', language) || 'Clear'}
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchBar

