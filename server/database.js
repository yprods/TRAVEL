import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let database = null

// Initialize SQLite database
export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const dbPath = process.env.DB_PATH || path.join(__dirname, 'database.sqlite')
  
  // Create database directory if it doesn't exist
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
  }

    database = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ SQLite connection error:', err)
        reject(err)
        return
      }
      console.log('✅ SQLite database connected successfully')
      
      // Enable foreign keys
      database.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) {
          reject(err)
          return
        }
        createTables(resolve, reject)
      })
    })
  })
}

const createTables = (resolve, reject) => {
  const tables = [
    `CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      note TEXT,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      position_x REAL NOT NULL,
      position_y REAL NOT NULL,
      position_z REAL NOT NULL,
      likes INTEGER DEFAULT 0,
      dislikes INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      visitors INTEGER DEFAULT 0,
      social_links TEXT,
      paypal_link TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      author TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS advice (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT,
      location_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATE,
      end_date DATE,
      locations TEXT,
      author TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password_hash TEXT NOT NULL,
      verified BOOLEAN DEFAULT 0,
      otp TEXT,
      otp_expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS user_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS location_visitors (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      user_id INTEGER,
      visitor_name TEXT,
      visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS groups (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )`,
    `CREATE TABLE IF NOT EXISTS access_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS stars_given (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      user_id INTEGER,
      amount INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS recordings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location_id INTEGER NOT NULL,
      filename TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
    )`
  ]

  let completed = 0
  const total = tables.length

  tables.forEach((sql) => {
    database.run(sql, (err) => {
      if (err) {
        console.error('Error creating table:', err)
        reject(err)
        return
      }
      completed++
      if (completed === total) {
        console.log('✅ Database tables initialized')
        resolve()
      }
    })
  })
}

// Query helper - returns array of rows
export const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!database) {
      reject(new Error('Database not initialized. Call initDatabase() first.'))
      return
    }
    database.all(sql, params, (err, rows) => {
      if (err) {
        console.error('Query error:', err)
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// Query one - returns single row or null
export const queryOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!database) {
      reject(new Error('Database not initialized. Call initDatabase() first.'))
      return
    }
    database.get(sql, params, (err, row) => {
      if (err) {
        console.error('QueryOne error:', err)
        reject(err)
      } else {
        resolve(row || null)
      }
    })
  })
}

// Run - for INSERT, UPDATE, DELETE
export const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!database) {
      reject(new Error('Database not initialized. Call initDatabase() first.'))
      return
    }
    database.run(sql, params, function(err) {
      if (err) {
        console.error('Run error:', err)
        reject(err)
      } else {
        resolve({
          id: this.lastInsertRowid,
          lastInsertRowid: this.lastInsertRowid,
          changes: this.changes
        })
      }
    })
  })
}

// Close database
export const closeDatabase = () => {
  if (database) {
    database.close((err) => {
      if (err) {
        console.error('Error closing database:', err)
      } else {
        console.log('✅ Database closed')
      }
    })
    database = null
  }
}
