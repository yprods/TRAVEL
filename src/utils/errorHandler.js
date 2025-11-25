// Global error handler utility
export class AppError extends Error {
  constructor(message, code, statusCode = 400) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    Error.captureStackTrace(this, this.constructor)
  }
}

export const errorMessages = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  INVALID_TOKEN: 'Invalid or expired token.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  OTP_EXPIRED: 'OTP has expired. Please request a new one.',
  OTP_INVALID: 'Invalid OTP code.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload an image or video.',
  LOCATION_NOT_FOUND: 'Location not found.',
  MEDIA_UPLOAD_FAILED: 'Failed to upload media. Please try again.',
  DATABASE_ERROR: 'Database error occurred.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.'
}

export const handleError = (error, language = 'en') => {
  console.error('Error:', error)

  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode
    }
  }

  if (error.response) {
    // API error response
    return {
      message: error.response.data?.error || error.response.data?.message || errorMessages.SERVER_ERROR,
      code: error.response.status,
      statusCode: error.response.status
    }
  }

  if (error.request) {
    // Network error
    return {
      message: errorMessages.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
      statusCode: 0
    }
  }

  // Generic error
  return {
    message: error.message || errorMessages.SERVER_ERROR,
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  }
}

export const showErrorToast = (error, setError) => {
  const errorInfo = handleError(error)
  setError(errorInfo.message)
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    setError(null)
  }, 5000)
}

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePhone = (phone) => {
  const re = /^[\d\s\-\+\(\)]+$/
  return re.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export const validatePassword = (password) => {
  return password.length >= 6
}

export const validateFile = (file, maxSize = 100 * 1024 * 1024) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
  
  if (!allowedTypes.includes(file.type)) {
    throw new AppError(errorMessages.INVALID_FILE_TYPE, 'INVALID_FILE_TYPE', 400)
  }
  
  if (file.size > maxSize) {
    throw new AppError(errorMessages.FILE_TOO_LARGE, 'FILE_TOO_LARGE', 400)
  }
  
  return true
}

