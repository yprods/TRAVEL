import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase } from './database-adapter.js'
import locationsRoutes from './routes/locations.js'
import mediaRoutes from './routes/media.js'
import commentsRoutes from './routes/comments.js'
import adviceRoutes from './routes/advice.js'
import tripsRoutes from './routes/trips.js'
import authRoutes from './routes/auth.js'
import { 
  securityHeaders, 
  apiLimiter, 
  uploadLimiter, 
  authLimiter,
  sanitizeInput
} from './middleware/security.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(securityHeaders)

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true,
  optionsSuccessStatus: 200
}
app.use(cors(corsOptions))

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Input sanitization
app.use(sanitizeInput)

// Rate limiting
app.use('/api/', apiLimiter)
app.use('/api/auth/', authLimiter)

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Initialize database before starting server
let dbReady = false

// Initialize database (MySQL if available, otherwise SQLite)
initDatabase()
  .then(() => {
    dbReady = true
    console.log('✅ Database ready')
  })
  .catch(err => {
    console.error('❌ Database initialization error:', err)
    // Continue anyway - database will be initialized on first query
  })

// Middleware to ensure database is ready
app.use('/api', async (req, res, next) => {
  if (!dbReady) {
    try {
      await initDatabase()
      dbReady = true
    } catch (err) {
      console.error('Database initialization failed:', err)
      return res.status(500).json({ error: 'Database not available' })
    }
  }
  next()
})

// Routes
app.use('/api/locations', locationsRoutes)
app.use('/api/media', mediaRoutes)
app.use('/api/comments', commentsRoutes)
app.use('/api/advice', adviceRoutes)
app.use('/api/trips', tripsRoutes)
app.use('/api/auth', authRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running', database: dbReady ? 'ready' : 'initializing' })
})

// Serve static files from dist directory in production
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))
  
  // Handle React Router - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    // Don't serve index.html for API routes
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'Route not found' })
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  
  const statusCode = err.statusCode || err.status || 500
  const message = err.message || 'Internal server error'
  
  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler (only for API routes in production, or all routes in dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' })
  })
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📁 Files stored in: ${path.join(__dirname, 'uploads')}`)
  const dbType = process.env.DB_TYPE === 'mysql' || process.env.DB_HOST ? 'MySQL' : 'SQLite'
  console.log(`💾 Database: ${dbType}${process.env.DB_HOST ? ` (${process.env.DB_HOST}:${process.env.DB_PORT || 3306})` : ''}`)
})

