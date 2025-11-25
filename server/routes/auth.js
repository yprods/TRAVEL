import express from 'express'
import { query, queryOne, run } from '../database-adapter.js'
import { authLimiter, escapeSQL, escapeHTML } from '../middleware/security.js'
import crypto from 'crypto'
import { sendOTPEmail } from '../utils/email.js'

const router = express.Router()

// Validation helpers
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

const validatePassword = (password) => {
  return password && password.length >= 6
}

// Error handling middleware
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Signup
router.post('/signup', authLimiter, asyncHandler(async (req, res) => {
  try {
    let { name, email, phone, password } = req.body
    
    // Sanitize inputs
    name = escapeHTML(escapeSQL(name?.trim() || ''))
    email = escapeSQL(email?.trim() || '').toLowerCase()
    phone = escapeSQL(phone?.trim() || '')
    password = password?.trim() || ''

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' })
    }
    
    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' })
    }
    
    if (!validatePassword(password)) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if user already exists
    const existingUser = await queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' })
    }

    // Hash password (simple hash for demo - use bcrypt in production)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Create user (unverified)
    const result = await run(
      `INSERT INTO users (name, email, phone, password_hash, otp, otp_expires_at, verified)
       VALUES (?, ?, ?, ?, ?, datetime('now', '+10 minutes'), 0)`,
      [name, email, phone, passwordHash, otp]
    )

    // Send OTP email
    try {
      await sendOTPEmail(email, name, otp)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
      // Continue even if email fails
    }

    res.json({ 
      message: 'User created. Please verify OTP.',
      userId: result.id 
    })
  } catch (error) {
    console.error('Error in signup:', error)
    if (error.message && error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'Email already exists' })
    }
    throw error
  }
}))

// Verify OTP
router.post('/verify-otp', authLimiter, asyncHandler(async (req, res) => {
  try {
    let { email, otp } = req.body
    
    // Sanitize inputs
    email = escapeSQL(email?.trim() || '').toLowerCase()
    otp = escapeSQL(otp?.trim() || '')

    // Validation
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' })
    }
    
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({ error: 'OTP must be 6 digits' })
    }

    const user = await queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (user.verified) {
      return res.status(400).json({ error: 'User already verified' })
    }

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' })
    }

    const now = new Date()
    const expiresAt = new Date(user.otp_expires_at)
    if (now > expiresAt) {
      return res.status(400).json({ error: 'OTP expired' })
    }

    // Verify user
    await run(
      'UPDATE users SET verified = 1, otp = NULL, otp_expires_at = NULL WHERE id = ?',
      [user.id]
    )

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')

    // Store token
    await run(
      `INSERT INTO user_sessions (user_id, token, expires_at)
       VALUES (?, ?, datetime('now', '+30 days'))`,
      [user.id, token]
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Error verifying OTP:', error)
    throw error
  }
}))

// Resend OTP
router.post('/resend-otp', authLimiter, asyncHandler(async (req, res) => {
  try {
    let { email } = req.body
    
    // Sanitize input
    email = escapeSQL(email?.trim() || '').toLowerCase()

    if (!email || !validateEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' })
    }

    const user = await queryOne(
      'SELECT * FROM users WHERE email = ? AND verified = 0',
      [email]
    )

    if (!user) {
      return res.status(404).json({ error: 'User not found or already verified' })
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    await run(
      `UPDATE users SET otp = ?, otp_expires_at = datetime('now', '+10 minutes')
       WHERE id = ?`,
      [otp, user.id]
    )

    // Send OTP email
    try {
      await sendOTPEmail(email, user.name, otp)
    } catch (emailError) {
      console.error('Error sending email:', emailError)
    }

    res.json({ message: 'OTP resent successfully' })
  } catch (error) {
    console.error('Error resending OTP:', error)
    throw error
  }
}))

// Login
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  try {
    let { email, password } = req.body
    
    // Sanitize inputs
    email = escapeSQL(email?.trim() || '').toLowerCase()
    password = password?.trim() || ''

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const user = await queryOne(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!user.verified) {
      return res.status(401).json({ error: 'Please verify your email first' })
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex')
    if (user.password_hash !== passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex')

    await run(
      `INSERT INTO user_sessions (user_id, token, expires_at)
       VALUES (?, ?, datetime('now', '+30 days'))`,
      [user.id, token]
    )

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('Error in login:', error)
    throw error
  }
}))

export default router

