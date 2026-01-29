import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'semasms',
  password: process.env.DB_PASSWORD || 'semasms_password',
  database: process.env.DB_NAME || 'semasms_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
let pool = null;

export async function initDatabase() {
  try {
    // First connect without database to create it if needed
    const tempPool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      waitForConnections: true,
      connectionLimit: 2
    });

    // Create database if not exists
    await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await tempPool.end();

    // Now connect to the database
    pool = mysql.createPool(dbConfig);

    // Create tables
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sms_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        total_recipients INT NOT NULL,
        sent_count INT DEFAULT 0,
        failed_count INT DEFAULT 0,
        status ENUM('pending', 'sending', 'completed', 'partial', 'failed') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        INDEX idx_created_at (created_at),
        INDEX idx_status (status)
      )
    `);

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS sms_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        batch_id INT,
        recipient VARCHAR(20) NOT NULL,
        message TEXT NOT NULL,
        sender_id VARCHAR(50) NOT NULL,
        status ENUM('success', 'failed', 'pending') NOT NULL,
        response TEXT,
        error TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (batch_id) REFERENCES sms_batches(id) ON DELETE CASCADE,
        INDEX idx_batch_id (batch_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        INDEX idx_recipient (recipient)
      )
    `);

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  }
}

// Create a new batch
export async function createBatch(senderId, message, totalRecipients) {
  const [result] = await pool.execute(
    'INSERT INTO sms_batches (sender_id, message, total_recipients, status) VALUES (?, ?, ?, ?)',
    [senderId, message, totalRecipients, 'sending']
  );
  return result.insertId;
}

// Update batch when complete
export async function completeBatch(batchId, sentCount, failedCount) {
  let status = 'completed';
  if (failedCount > 0 && sentCount > 0) status = 'partial';
  else if (sentCount === 0) status = 'failed';

  await pool.execute(
    'UPDATE sms_batches SET sent_count = ?, failed_count = ?, status = ?, completed_at = NOW() WHERE id = ?',
    [sentCount, failedCount, status, batchId]
  );
}

// Save individual SMS record
export async function saveSmsRecord(batchId, recipient, message, senderId, status, response = null, error = null) {
  await pool.execute(
    'INSERT INTO sms_records (batch_id, recipient, message, sender_id, status, response, error) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [batchId, recipient, message, senderId, status, response, error]
  );
}

// Get all batches with pagination
export async function getSmsBatches(limit = 50, offset = 0) {
  const [rows] = await pool.query(
    `SELECT * FROM sms_batches ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
  );
  return rows;
}

// Get batch by ID
export async function getBatch(batchId) {
  const [rows] = await pool.execute('SELECT * FROM sms_batches WHERE id = ?', [batchId]);
  return rows[0] || null;
}

// Get records for a specific batch
export async function getBatchRecords(batchId) {
  const [rows] = await pool.execute(
    'SELECT * FROM sms_records WHERE batch_id = ? ORDER BY created_at ASC',
    [batchId]
  );
  return rows;
}

// Get all records with pagination
export async function getSmsRecords(limit = 100, offset = 0) {
  const [rows] = await pool.query(
    `SELECT * FROM sms_records ORDER BY created_at DESC LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}`
  );
  return rows;
}

// Get statistics
export async function getStatistics() {
  const [allTime] = await pool.execute(`
    SELECT 
      COUNT(*) as total_messages,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as sent_messages,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_messages,
      COUNT(DISTINCT batch_id) as total_batches
    FROM sms_records
  `);

  const [today] = await pool.execute(`
    SELECT 
      COUNT(*) as total_messages,
      SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as sent_messages,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_messages
    FROM sms_records
    WHERE DATE(created_at) = CURDATE()
  `);

  return { allTime: allTime[0], today: today[0] };
}

// Get total counts
export async function getTotalBatches() {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM sms_batches');
  return rows[0].count;
}

export async function getTotalRecords() {
  const [rows] = await pool.execute('SELECT COUNT(*) as count FROM sms_records');
  return rows[0].count;
}

// Search records by recipient
export async function searchByRecipient(recipient, limit = 50) {
  const [rows] = await pool.execute(
    `SELECT * FROM sms_records WHERE recipient LIKE ? ORDER BY created_at DESC LIMIT ${parseInt(limit)}`,
    [`%${recipient}%`]
  );
  return rows;
}

// Get records by date range
export async function getRecordsByDateRange(startDate, endDate, limit = 100) {
  const [rows] = await pool.execute(
    `SELECT * FROM sms_records WHERE created_at BETWEEN ? AND ? ORDER BY created_at DESC LIMIT ${parseInt(limit)}`,
    [startDate, endDate]
  );
  return rows;
}

export default pool;
