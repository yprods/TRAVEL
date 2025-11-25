import express from 'express'
import { query, queryOne, run } from '../database-adapter.js'
import { escapeSQL, escapeHTML } from '../middleware/security.js'

const router = express.Router()

// Get all trip plans
router.get('/', async (req, res) => {
  try {
    const trips = await query(
      'SELECT * FROM trip_plans ORDER BY created_at DESC'
    )
    res.json(trips)
  } catch (error) {
    console.error('Error fetching trips:', error)
    res.status(500).json({ error: 'Failed to fetch trips' })
  }
})

// Get single trip plan with requests and responses
router.get('/:id', async (req, res) => {
  try {
    const trip = await queryOne(
      'SELECT * FROM trip_plans WHERE id = ?',
      [req.params.id]
    )
    
    if (!trip) {
      return res.status(404).json({ error: 'Trip plan not found' })
    }
    
    const requests = await query(
      'SELECT * FROM trip_requests WHERE trip_plan_id = ? ORDER BY created_at DESC',
      [trip.id]
    )
    
    const requestsWithResponses = await Promise.all(
      requests.map(async (request) => {
        const responses = await query(
          'SELECT * FROM trip_responses WHERE request_id = ? ORDER BY created_at',
          [request.id]
        )
        return { ...request, responses }
      })
    )
    
    res.json({ ...trip, requests: requestsWithResponses })
  } catch (error) {
    console.error('Error fetching trip:', error)
    res.status(500).json({ error: 'Failed to fetch trip' })
  }
})

// Create trip plan
router.post('/', async (req, res) => {
  try {
    const { title, description, start_date, end_date, locations, author } = req.body
    
    const result = await run(
      `INSERT INTO trip_plans (title, description, start_date, end_date, locations, author)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description || null, start_date || null, end_date || null, 
       locations ? JSON.stringify(locations) : null, author || 'Anonymous']
    )
    
    const trip = await queryOne(
      'SELECT * FROM trip_plans WHERE id = ?',
      [result.id]
    )
    
    res.status(201).json(trip)
  } catch (error) {
    console.error('Error creating trip:', error)
    res.status(500).json({ error: 'Failed to create trip' })
  }
})

// Update trip plan
router.put('/:id', async (req, res) => {
  try {
    const { title, description, start_date, end_date, locations, status } = req.body
    
    const updates = []
    const params = []
    
    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?')
      params.push(start_date)
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?')
      params.push(end_date)
    }
    if (locations !== undefined) {
      updates.push('locations = ?')
      params.push(JSON.stringify(locations))
    }
    if (status !== undefined) {
      updates.push('status = ?')
      params.push(status)
    }
    
    updates.push('updated_at = CURRENT_TIMESTAMP')
    params.push(req.params.id)
    
    await run(
      `UPDATE trip_plans SET ${updates.join(', ')} WHERE id = ?`,
      params
    )
    
    const trip = await queryOne(
      'SELECT * FROM trip_plans WHERE id = ?',
      [req.params.id]
    )
    
    res.json(trip)
  } catch (error) {
    console.error('Error updating trip:', error)
    res.status(500).json({ error: 'Failed to update trip' })
  }
})

// Delete trip plan
router.delete('/:id', async (req, res) => {
  try {
    await run('DELETE FROM trip_plans WHERE id = ?', [req.params.id])
    res.json({ message: 'Trip plan deleted successfully' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    res.status(500).json({ error: 'Failed to delete trip' })
  }
})

// Create trip request
router.post('/:id/requests', async (req, res) => {
  try {
    const { request_type, location_id, message, author } = req.body
    
    const result = await run(
      `INSERT INTO trip_requests (trip_plan_id, request_type, location_id, message, author)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.id, request_type, location_id || null, message || null, author || 'Anonymous']
    )
    
    const request = await queryOne(
      'SELECT * FROM trip_requests WHERE id = ?',
      [result.id]
    )
    
    res.status(201).json(request)
  } catch (error) {
    console.error('Error creating request:', error)
    res.status(500).json({ error: 'Failed to create request' })
  }
})

// Add response to request
router.post('/requests/:requestId/responses', async (req, res) => {
  try {
    const { author, response_type, content, media_id } = req.body
    
    const result = await run(
      `INSERT INTO trip_responses (request_id, author, response_type, content, media_id)
       VALUES (?, ?, ?, ?, ?)`,
      [req.params.requestId, author || 'Anonymous', response_type, content || null, media_id || null]
    )
    
    const response = await queryOne(
      'SELECT * FROM trip_responses WHERE id = ?',
      [result.id]
    )
    
    res.status(201).json(response)
  } catch (error) {
    console.error('Error adding response:', error)
    res.status(500).json({ error: 'Failed to add response' })
  }
})

export default router

