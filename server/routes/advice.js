import express from 'express'
import { query, run } from '../database-adapter.js'
import { escapeSQL, escapeHTML } from '../middleware/security.js'

const router = express.Router()

// Get all advice
router.get('/', async (req, res) => {
  try {
    const advice = await query(
      'SELECT * FROM advice ORDER BY created_at DESC'
    )
    res.json(advice)
  } catch (error) {
    console.error('Error fetching advice:', error)
    res.status(500).json({ error: 'Failed to fetch advice' })
  }
})

// Add advice
router.post('/', async (req, res) => {
  try {
    const { author, text, content, title } = req.body
    
    // Support both 'text' and 'content' fields for backward compatibility
    const adviceText = text || content || ''
    const adviceTitle = title || 'Travel Advice'
    
    if (!adviceText) {
      return res.status(400).json({ error: 'text or content is required' })
    }
    
    const result = await run(
      'INSERT INTO advice (author, title, content) VALUES (?, ?, ?)',
      [author || 'Anonymous', adviceTitle, adviceText]
    )
    
    const advice = await query('SELECT * FROM advice WHERE id = ?', [result.lastInsertRowid || result.id])
    res.status(201).json(advice[0])
  } catch (error) {
    console.error('Error adding advice:', error)
    res.status(500).json({ error: 'Failed to add advice' })
  }
})

// Delete advice
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM advice WHERE id = ?', [req.params.id])
    res.json({ message: 'Advice deleted successfully' })
  } catch (error) {
    console.error('Error deleting advice:', error)
    res.status(500).json({ error: 'Failed to delete advice' })
  }
})

export default router

