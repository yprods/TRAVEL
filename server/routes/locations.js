import express from 'express'
import { query, queryOne, run } from '../database-adapter.js'
import { escapeSQL, escapeHTML } from '../middleware/security.js'

const router = express.Router()

// Error handling middleware
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Get all locations
router.get('/', asyncHandler(async (req, res) => {
  try {
    const locations = await query(`
      SELECT 
        l.*,
        COUNT(DISTINCT m.id) as media_count,
        COUNT(DISTINCT c.id) as comment_count
      FROM locations l
      LEFT JOIN media m ON l.id = m.location_id
      LEFT JOIN comments c ON l.id = c.location_id
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `)
    
    // Get media for each location
    const locationsWithMedia = await Promise.all(
      locations.map(async (location) => {
        const media = await query(
          'SELECT * FROM media WHERE location_id = ? ORDER BY created_at',
          [location.id]
        )
        const comments = await query(
          'SELECT * FROM comments WHERE location_id = ? ORDER BY created_at',
          [location.id]
        )
        return {
          ...location,
          position: [location.position_x, location.position_y, location.position_z],
          media: media.map(m => ({
            id: m.id,
            url: `/uploads/${m.filename}`,
            name: m.original_name,
            type: m.file_type.startsWith('image/') ? 'image' : 'video'
          })),
          comments: comments
        }
      })
    )
    
    res.json(locationsWithMedia)
  } catch (error) {
    console.error('Error fetching locations:', error)
    throw error
  }
}))

// Get single location
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const location = await queryOne(
      'SELECT * FROM locations WHERE id = ?',
      [req.params.id]
    )
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' })
    }
    
    const media = await query(
      'SELECT * FROM media WHERE location_id = ? ORDER BY created_at',
      [location.id]
    )
    const comments = await query(
      'SELECT * FROM comments WHERE location_id = ? ORDER BY created_at',
      [location.id]
    )
    
    res.json({
      ...location,
      position: [location.position_x, location.position_y, location.position_z],
      media: media.map(m => ({
        id: m.id,
        url: `/uploads/${m.filename}`,
        name: m.original_name,
        type: m.file_type.startsWith('image/') ? 'image' : 'video'
      })),
      comments: comments
    })
  } catch (error) {
    console.error('Error fetching location:', error)
    throw error
  }
}))

// Create location
router.post('/', asyncHandler(async (req, res) => {
  try {
    let { title, note, lat, lon, position } = req.body
    
    // Sanitize inputs
    title = escapeHTML(escapeSQL(title?.trim() || ''))
    note = escapeHTML(escapeSQL(note?.trim() || ''))
    
    // Validation
    if (typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ error: 'Invalid latitude or longitude' })
    }
    
    if (!position || !Array.isArray(position) || position.length !== 3) {
      return res.status(400).json({ error: 'Invalid position array' })
    }
    
    // Validate lat/lon ranges
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' })
    }
    
    const result = await run(
      `INSERT INTO locations (title, note, lat, lon, position_x, position_y, position_z)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title || null, note || null, lat, lon, position[0], position[1], position[2]]
    )
    
    const location = await queryOne(
      'SELECT * FROM locations WHERE id = ?',
      [result.id]
    )
    
    res.status(201).json({
      ...location,
      position: [location.position_x, location.position_y, location.position_z],
      media: [],
      comments: []
    })
  } catch (error) {
    console.error('Error creating location:', error)
    throw error
  }
}))

// Update location
router.put('/:id', async (req, res) => {
  try {
    const { title, note, likes, dislikes, shares } = req.body
    
    const updates = []
    const params = []
    
    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (note !== undefined) {
      updates.push('note = ?')
      params.push(note)
    }
    if (likes !== undefined) {
      updates.push('likes = ?')
      params.push(likes)
    }
    if (dislikes !== undefined) {
      updates.push('dislikes = ?')
      params.push(dislikes)
    }
    if (shares !== undefined) {
      updates.push('shares = ?')
      params.push(shares)
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(req.params.id)
    
    await run(
      `UPDATE locations SET ${updates.join(', ')} WHERE id = ?`,
      params
    )
    
    const location = await queryOne(
      'SELECT * FROM locations WHERE id = ?',
      [req.params.id]
    )
    
    const media = await query(
      'SELECT * FROM media WHERE location_id = ? ORDER BY created_at',
      [location.id]
    )
    const comments = await query(
      'SELECT * FROM comments WHERE location_id = ? ORDER BY created_at',
      [location.id]
    )
    
    res.json({
      ...location,
      position: [location.position_x, location.position_y, location.position_z],
      media: media.map(m => ({
        id: m.id,
        url: `/uploads/${m.filename}`,
        name: m.original_name,
        type: m.file_type.startsWith('image/') ? 'image' : 'video'
      })),
      comments: comments
    })
  } catch (error) {
    console.error('Error updating location:', error)
    res.status(500).json({ error: 'Failed to update location' })
  }
})

// Delete location
router.delete('/:id', async (req, res) => {
  try {
    // Get media files to delete
    const media = await query(
      'SELECT file_path FROM media WHERE location_id = ?',
      [req.params.id]
    )
    
    // Delete files from filesystem
    const fs = await import('fs')
    const path = await import('path')
    media.forEach(m => {
      const filePath = path.join(process.cwd(), m.file_path)
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    })
    
    await run('DELETE FROM locations WHERE id = ?', [req.params.id])
    res.json({ message: 'Location deleted successfully' })
  } catch (error) {
    console.error('Error deleting location:', error)
    res.status(500).json({ error: 'Failed to delete location' })
  }
})

// Like location
router.post('/:id/like', async (req, res) => {
  try {
    await run('UPDATE locations SET likes = likes + 1 WHERE id = ?', [req.params.id])
    const location = await queryOne('SELECT likes FROM locations WHERE id = ?', [req.params.id])
    res.json({ likes: location.likes })
  } catch (error) {
    console.error('Error liking location:', error)
    res.status(500).json({ error: 'Failed to like location' })
  }
})

// Dislike location
router.post('/:id/dislike', async (req, res) => {
  try {
    await run('UPDATE locations SET dislikes = dislikes + 1 WHERE id = ?', [req.params.id])
    const location = await queryOne('SELECT dislikes FROM locations WHERE id = ?', [req.params.id])
    res.json({ dislikes: location.dislikes })
  } catch (error) {
    console.error('Error disliking location:', error)
    res.status(500).json({ error: 'Failed to dislike location' })
  }
})

// Share location
router.post('/:id/share', asyncHandler(async (req, res) => {
  try {
    await run('UPDATE locations SET shares = shares + 1 WHERE id = ?', [req.params.id])
    const location = await queryOne('SELECT shares FROM locations WHERE id = ?', [req.params.id])
    res.json({ shares: location.shares })
  } catch (error) {
    console.error('Error sharing location:', error)
    throw error
  }
}))

// Check in visitor
router.post('/:id/checkin', asyncHandler(async (req, res) => {
  try {
    const { visitor_name } = req.body
    
    // Increment visitor count
    await run('UPDATE locations SET visitors = visitors + 1 WHERE id = ?', [req.params.id])
    
    // Record visitor
    await run(
      'INSERT INTO location_visitors (location_id, visitor_name) VALUES (?, ?)',
      [req.params.id, visitor_name || 'Anonymous']
    )
    
    const location = await queryOne('SELECT visitors FROM locations WHERE id = ?', [req.params.id])
    res.json({ visitors: location.visitors })
  } catch (error) {
    console.error('Error checking in:', error)
    throw error
  }
}))

// Get location visitors
router.get('/:id/visitors', asyncHandler(async (req, res) => {
  try {
    const visitors = await query(
      'SELECT * FROM location_visitors WHERE location_id = ? ORDER BY visited_at DESC',
      [req.params.id]
    )
    res.json(visitors)
  } catch (error) {
    console.error('Error fetching visitors:', error)
    throw error
  }
}))

export default router

