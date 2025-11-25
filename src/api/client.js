import { AppError, errorMessages } from '../utils/errorHandler'

const API_BASE = '/api'

const handleResponse = async (response) => {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const errorMessage = data.error || data.message || errorMessages.SERVER_ERROR
    throw new AppError(errorMessage, response.status, response.status)
  }
  return response.json()
}

const handleRequest = async (url, options = {}) => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    return await handleResponse(response)
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new AppError(errorMessages.TIMEOUT_ERROR, 'TIMEOUT_ERROR', 408)
    }
    if (error instanceof AppError) {
      throw error
    }
    throw new AppError(errorMessages.NETWORK_ERROR, 'NETWORK_ERROR', 0)
  }
}

export const api = {
  // Locations
  getLocations: async () => {
    return handleRequest(`${API_BASE}/locations`)
  },
  
  getLocation: async (id) => {
    return handleRequest(`${API_BASE}/locations/${id}`)
  },
  
  createLocation: async (location) => {
    return handleRequest(`${API_BASE}/locations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location)
    })
  },
  
  updateLocation: async (id, updates) => {
    return handleRequest(`${API_BASE}/locations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
  },
  
  deleteLocation: async (id) => {
    return handleRequest(`${API_BASE}/locations/${id}`, {
      method: 'DELETE'
    })
  },
  
  likeLocation: async (id) => {
    return handleRequest(`${API_BASE}/locations/${id}/like`, {
      method: 'POST'
    })
  },
  
  dislikeLocation: async (id) => {
    return handleRequest(`${API_BASE}/locations/${id}/dislike`, {
      method: 'POST'
    })
  },
  
  shareLocation: async (id) => {
    return handleRequest(`${API_BASE}/locations/${id}/share`, {
      method: 'POST'
    })
  },
  
  // Media
  uploadMedia: async (locationId, files) => {
    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })
      
      return handleRequest(`${API_BASE}/media/${locationId}`, {
        method: 'POST',
        body: formData
      })
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new AppError(errorMessages.MEDIA_UPLOAD_FAILED, 'MEDIA_UPLOAD_FAILED', 500)
    }
  },
  
  deleteMedia: async (id) => {
    return handleRequest(`${API_BASE}/media/${id}`, {
      method: 'DELETE'
    })
  },
  
  // Comments
  getComments: async (locationId) => {
    return handleRequest(`${API_BASE}/comments/location/${locationId}`)
  },
  
  addComment: async (comment) => {
    return handleRequest(`${API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    })
  },
  
  // Advice
  getAdvice: async () => {
    return handleRequest(`${API_BASE}/advice`)
  },
  
  addAdvice: async (advice) => {
    return handleRequest(`${API_BASE}/advice`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(advice)
    })
  },
  
  // Auth
  signup: async (userData) => {
    return handleRequest(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
  },
  
  verifyOTP: async (email, otp) => {
    return handleRequest(`${API_BASE}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    })
  },
  
  resendOTP: async (email) => {
    return handleRequest(`${API_BASE}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
  },
  
  login: async (email, password) => {
    return handleRequest(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
  },
  
  // Location visitors
  checkIn: async (locationId, visitorName) => {
    return handleRequest(`${API_BASE}/locations/${locationId}/checkin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_name: visitorName })
    })
  },
  
  getVisitors: async (locationId) => {
    return handleRequest(`${API_BASE}/locations/${locationId}/visitors`)
  }
}

