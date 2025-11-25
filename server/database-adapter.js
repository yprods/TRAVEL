// Database adapter that switches between MySQL and SQLite
// Import the appropriate database module based on environment

let db = null
let initPromise = null

export const initDatabase = async () => {
  if (initPromise) {
    return initPromise
  }

  initPromise = (async () => {
    const useMySQL = process.env.DB_TYPE === 'mysql' || process.env.DB_HOST
    
    if (useMySQL) {
      try {
        const mysqlDb = await import('./database-mysql.js')
        await mysqlDb.initDatabase()
        db = mysqlDb
        return db
      } catch (error) {
        console.warn('MySQL connection failed, falling back to SQLite:', error.message)
        const sqliteDb = await import('./database.js')
        await sqliteDb.initDatabase()
        db = sqliteDb
        return db
      }
    } else {
      const sqliteDb = await import('./database.js')
      await sqliteDb.initDatabase()
      db = sqliteDb
      return db
    }
  })()

  return initPromise
}

// Export database functions
export const query = async (...args) => {
  if (!db) {
    await initDatabase()
  }
  return db.query(...args)
}

export const queryOne = async (...args) => {
  if (!db) {
    await initDatabase()
  }
  return db.queryOne(...args)
}

export const run = async (...args) => {
  if (!db) {
    await initDatabase()
  }
  return db.run(...args)
}

export const closeDatabase = async (...args) => {
  if (db && db.closeDatabase) {
    return db.closeDatabase(...args)
  }
}

