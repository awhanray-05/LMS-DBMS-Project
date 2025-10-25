const oracledb = require('oracledb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Oracle DB Configuration
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: `${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_SERVICE_NAME}`,
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 1,
  poolTimeout: 60,
  stmtCacheSize: 30
};

// Initialize Oracle DB connection pool
let pool;

const initializeDatabase = async () => {
  try {
    // Set Oracle client configuration
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    oracledb.autoCommit = true;
    
    // Create connection pool
    pool = await oracledb.createPool(dbConfig);
    console.log('Oracle Database connection pool created successfully');
    
    // Test connection
    const connection = await pool.getConnection();
    await connection.close();
    console.log('Database connection test successful');
    
    return pool;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

const getConnection = async () => {
  try {
    if (!pool) {
      await initializeDatabase();
    }
    return await pool.getConnection();
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw error;
  }
};

const closePool = async () => {
  try {
    if (pool) {
      await pool.close();
      console.log('Database connection pool closed');
    }
  } catch (error) {
    console.error('Error closing database pool:', error);
  }
};

module.exports = {
  initializeDatabase,
  getConnection,
  closePool,
  pool
};
