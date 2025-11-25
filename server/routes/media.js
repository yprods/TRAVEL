import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import { query, queryOne, run } from '../database-adapter.js'
import { uploadLimiter, validateFileUpload } from '../middleware/security.js'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadsDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image and video files are allowed!'))
    }
  }
})

// Upload media for a location
router.post('/:locationId', uploadLimiter, upload.array('files', 10), validateFileUpload, async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' })
    }
    
    // Validate location exists
    const location = await queryOne('SELECT id FROM locations WHERE id = ?', [req.params.locationId])
    if (!location) {
      return res.status(404).json({ error: 'Location not found' })
    }
    
    const locationId = req.params.locationId
    const uploadedFiles = []
    
    for (const file of req.files) {
      const filePath = path.join('uploads', file.filename).replace(/\\/g, '/')
      
      const result = await run(
        `INSERT INTO media (location_id, filename, original_name, file_path, file_type, file_size)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [locationId, file.filename, file.originalname, filePath, file.mimetype, file.size]
      )
      
      uploadedFiles.push({
        id: result.id,
        url: `/uploads/${file.filename}`,
        name: file.originalname,
        type: file.mimetype.startsWith('image/') ? 'image' : 'video'
      })
    }
    
    res.status(201).json(uploadedFiles)
  } catch (error) {
    console.error('Error uploading media:', error)
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds limit (100MB)' })
    }
    if (error.message.includes('Only image and video')) {
      return res.status(400).json({ error: 'Only image and video files are allowed' })
    }
    next(error)
  }
})

// Delete media
router.delete('/:id', async (req, res) => {
  try {
    const media = await query('SELECT file_path FROM media WHERE id = ?', [req.params.id])
    
    if (media.length === 0) {
      return res.status(404).json({ error: 'Media not found' })
    }
    
    // Delete file from filesystem
    const filePath = path.join(__dirname, media[0].file_path)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
    
    await run('DELETE FROM media WHERE id = ?', [req.params.id])
    res.json({ message: 'Media deleted successfully' })
  } catch (error) {
    console.error('Error deleting media:', error)
    res.status(500).json({ error: 'Failed to delete media' })
  }
})

export default router

