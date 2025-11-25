import { create } from 'zustand'
import { api } from './api/client'

export const useStore = create((set, get) => ({
  dots: [],
  selectedDot: null,
  clickLocation: null,
  searchQuery: '',
  searchFilters: {
    hasMedia: false,
    hasComments: false,
    minLikes: 0,
    dateRange: null
  },
  adviceList: [],
  loading: false,
  error: null,
  setError: (error) => set({ error }),
  language: localStorage.getItem('language') || 'he',
  socialLinks: JSON.parse(localStorage.getItem('socialLinks') || '[]'),
  donateLink: localStorage.getItem('donateLink') || 'https://www.paypal.com/donate/?hosted_button_id=QPPDT97GAMX58',
  stars: JSON.parse(localStorage.getItem('stars') || '{}'),
  accessToken: localStorage.getItem('accessToken') || null,
  theme: localStorage.getItem('theme') || 'light',
  travelerActive: false,
  travelerTarget: null,
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  currentGroup: null,
  
  // Load data from API
  loadData: async () => {
    set({ loading: true, error: null })
    try {
      const [dots, advice] = await Promise.all([
        api.getLocations(),
        api.getAdvice()
      ])
      set({ dots, adviceList: advice, loading: false })
    } catch (error) {
      console.error('Error loading data:', error)
      set({ error: error.message, loading: false })
    }
  },
  
  addDot: async (dot) => {
    try {
      const newDot = await api.createLocation({
        title: dot.title,
        note: dot.note,
        lat: dot.lat,
        lon: dot.lon,
        position: dot.position
      })
      set((state) => ({ dots: [...state.dots, newDot] }))
      return newDot
    } catch (error) {
      console.error('Error adding dot:', error)
      const { handleError } = await import('./utils/errorHandler')
      const errorInfo = handleError(error)
      set({ error: errorInfo.message })
      throw error
    }
  },
  
  setSelectedDot: (dot) => set({ selectedDot: dot }),
  
  setClickLocation: (location) => set({ clickLocation: location }),
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSearchFilters: (filters) => set({ searchFilters: { ...get().searchFilters, ...filters } }),
  
  setLanguage: (lang) => {
    localStorage.setItem('language', lang)
    set({ language: lang })
  },
  
  setSocialLinks: (links) => {
    localStorage.setItem('socialLinks', JSON.stringify(links))
    set({ socialLinks: links })
  },
  
  setDonateLink: (link) => {
    localStorage.setItem('donateLink', link)
    set({ donateLink: link })
  },
  
  sendStars: (locationId, amount = 1) => {
    const stars = get().stars
    const currentStars = stars[locationId] || 0
    const newStars = { ...stars, [locationId]: currentStars + amount }
    localStorage.setItem('stars', JSON.stringify(newStars))
    set({ stars: newStars })
  },
  
  getStars: (locationId) => {
    return get().stars[locationId] || 0
  },
  
  generateAccessToken: () => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('') + 
      Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    localStorage.setItem('accessToken', token)
    set({ accessToken: token })
    return token
  },
  
  setAccessToken: (token) => {
    localStorage.setItem('accessToken', token)
    set({ accessToken: token })
  },
  
  setTheme: (theme) => {
    localStorage.setItem('theme', theme)
    set({ theme })
  },
  
  setTravelerActive: (active) => set({ travelerActive: active }),
  
  setTravelerTarget: (target) => set({ travelerTarget: target }),
  
  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
      localStorage.removeItem('userToken')
    }
    set({ user })
  },
  
  setCurrentGroup: (groupId) => {
    localStorage.setItem('currentGroup', groupId)
    set({ currentGroup: groupId })
  },
  
  updateDot: async (id, updates) => {
    try {
      const updated = await api.updateLocation(id, updates)
      set((state) => ({
        dots: state.dots.map(dot => dot.id === id ? updated : dot)
      }))
      return updated
    } catch (error) {
      console.error('Error updating dot:', error)
      set({ error: error.message })
      throw error
    }
  },
  
  uploadMedia: async (locationId, files) => {
    try {
      const media = await api.uploadMedia(locationId, files)
      const location = await api.getLocation(locationId)
      set((state) => ({
        dots: state.dots.map(dot => dot.id === locationId ? location : dot)
      }))
      return media
    } catch (error) {
      console.error('Error uploading media:', error)
      set({ error: error.message })
      throw error
    }
  },
  
  addComment: async (dotId, comment) => {
    try {
      const newComment = await api.addComment({
        location_id: dotId,
        author: comment.author,
        text: comment.text
      })
      const location = await api.getLocation(dotId)
      set((state) => ({
        dots: state.dots.map(dot => dot.id === dotId ? location : dot)
      }))
      return newComment
    } catch (error) {
      console.error('Error adding comment:', error)
      set({ error: error.message })
      throw error
    }
  },
  
  toggleLike: async (dotId) => {
    try {
      const result = await api.likeLocation(dotId)
      set((state) => ({
        dots: state.dots.map(dot => 
          dot.id === dotId ? { ...dot, likes: result.likes } : dot
        )
      }))
    } catch (error) {
      console.error('Error liking:', error)
      set({ error: error.message })
    }
  },
  
  toggleDislike: async (dotId) => {
    try {
      const result = await api.dislikeLocation(dotId)
      set((state) => ({
        dots: state.dots.map(dot => 
          dot.id === dotId ? { ...dot, dislikes: result.dislikes } : dot
        )
      }))
    } catch (error) {
      console.error('Error disliking:', error)
      set({ error: error.message })
    }
  },
  
  incrementShare: async (dotId) => {
    try {
      const result = await api.shareLocation(dotId)
      set((state) => ({
        dots: state.dots.map(dot => 
          dot.id === dotId ? { ...dot, shares: result.shares } : dot
        )
      }))
    } catch (error) {
      console.error('Error sharing:', error)
      set({ error: error.message })
    }
  },
  
  addAdvice: async (advice) => {
    try {
      const newAdvice = await api.addAdvice(advice)
      set((state) => ({
        adviceList: [...state.adviceList, newAdvice]
      }))
      return newAdvice
    } catch (error) {
      console.error('Error adding advice:', error)
      set({ error: error.message })
      throw error
    }
  }
}))

