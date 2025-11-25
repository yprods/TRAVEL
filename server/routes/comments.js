import express from 'express'
import { query, run } from '../database-adapter.js'
import { escapeSQL, escapeHTML } from '../middleware/security.js'

const router = express.Router()

// Get comments for a location
router.get('/location/:locationId', async (req, res) => {
  try {
    const comments = await query(
      'SELECT * FROM comments WHERE location_id = ? ORDER BY created_at DESC',
      [req.params.locationId]
    )
    res.json(comments)
  } catch (error) {
    console.error('Error fetching comments:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})

// Add comment
router.post('/', async (req, res) => {
  try {
    const { location_id, author, text } = req.body
    
    if (!location_id || !text) {
      return res.status(400).json({ error: 'location_id and text are required' })
    }
    
    const result = await run(
      'INSERT INTO comments (location_id, author, text) VALUES (?, ?, ?)',
      [location_id, author || 'Anonymous', text]
    )
    
    const comment = await query('SELECT * FROM comments WHERE id = ?', [result.id])
    res.status(201).json(comment[0])
  } catch (error) {
    console.error('Error adding comment:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM comments WHERE id = ?', [req.params.id])
    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Error deleting comment:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

export default router

