import mysql from 'mysql2/promise'

let pool = null

// Initialize MySQL connection pool
export const initDatabase = async () => {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'travel_user',
    password: process.env.DB_PASSWORD || 'travel_password',
    database: process.env.DB_NAME || 'travel_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }

  try {
    pool = mysql.createPool(config)
    
    // Test connection
    const connection = await pool.getConnection()
    await connection.ping()
    connection.release()
    
    console.log('✅ MySQL database connected successfully')
    return pool
  } catch (error) {
    console.error('❌ MySQL connection error:', error)
    throw error
  }
}

// Get connection pool
export const getPool = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return pool
}

// Query helper - returns array of rows
export const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Query error:', error)
    throw error
  }
}

// Query one - returns single row or null
export const queryOne = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params)
    return rows[0] || null
  } catch (error) {
    console.error('QueryOne error:', error)
    throw error
  }
}

// Run - for INSERT, UPDATE, DELETE
export const run = async (sql, params = []) => {
  try {
    const [result] = await pool.execute(sql, params)
    return {
      lastInsertRowid: result.insertId,
      changes: result.affectedRows
    }
  } catch (error) {
    console.error('Run error:', error)
    throw error
  }
}

// Close connection pool
export const closeDatabase = async () => {
  if (pool) {
    await pool.end()
    pool = null
    console.log('✅ MySQL connection closed')
  }
}

