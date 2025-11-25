import rateLimit from 'express-rate-limit'

// Rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: 'Too many uploads from this IP, please try again later.',
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true,
})

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  
  next()
}

// Input sanitization
export const sanitizeInput = (req, res, next) => {
  const sanitize = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        // Remove potentially dangerous characters
        obj[key] = obj[key]
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim()
      } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        sanitize(obj[key])
      }
    }
  }

  if (req.body) sanitize(req.body)
  if (req.query) sanitize(req.query)
  if (req.params) sanitize(req.params)

  next()
}

// File upload validation
export const validateFileUpload = (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next()
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]

  const maxFileSize = 100 * 1024 * 1024 // 100MB

  for (const file of req.files) {
    // Check file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({ 
        error: `File type ${file.mimetype} is not allowed` 
      })
    }

    // Check file size
    if (file.size > maxFileSize) {
      return res.status(400).json({ 
        error: `File size exceeds maximum limit of 100MB` 
      })
    }

    // Check for malicious file names
    if (file.originalname.includes('..') || 
        file.originalname.includes('/') || 
        file.originalname.includes('\\') ||
        file.originalname.length > 255) {
      return res.status(400).json({ 
        error: 'Invalid file name' 
      })
    }
  }

  next()
}

// SQL injection prevention helper
export const escapeSQL = (str) => {
  if (typeof str !== 'string') return str
  return str.replace(/'/g, "''").replace(/;/g, '').replace(/--/g, '')
}

// XSS prevention
export const escapeHTML = (str) => {
  if (typeof str !== 'string') return str
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return str.replace(/[&<>"']/g, m => map[m])
}

// Validate URL
export const validateURL = (url) => {
  try {
    const parsed = new URL(url)
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false
    }
    return true
  } catch {
    return false
  }
}
