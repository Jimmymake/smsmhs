import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  initDatabase,
  createBatch,
  completeBatch,
  saveSmsRecord,
  getSmsBatches,
  getBatch,
  getBatchRecords,
  getSmsRecords,
  getStatistics,
  getTotalBatches,
  getTotalRecords,
  searchByRecipient
} from './database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// SemaSMS API configuration
const SEMASMS_API_URL = 'https://portal-api.semasms.co.ke/send';

// Generate Basic Auth header
function getAuthHeader(username, password) {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Send single SMS
app.post('/api/sms/send', async (req, res) => {
  try {
    const { recipient, message, credentials, senderId } = req.body;

    if (!recipient || !message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing required fields: recipient, message' 
      });
    }

    const username = credentials?.username || process.env.SEMASMS_USERNAME;
    const password = credentials?.password || process.env.SEMASMS_PASSWORD;
    const sender = senderId || process.env.SEMASMS_SENDER_ID;

    if (!username || !password || !sender) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing API credentials or sender ID' 
      });
    }

    // Create a batch for single SMS
    const batchId = await createBatch(sender, message, 1);

    const response = await fetch(SEMASMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': getAuthHeader(username, password)
      },
      body: JSON.stringify({
        sender,
        recipient,
        message,
        bulk: '1'
      })
    });

    const data = await response.text();
    const status = response.ok ? 'success' : 'failed';

    // Save record to database
    await saveSmsRecord(batchId, recipient, message, sender, status, response.ok ? data : null, response.ok ? null : data);
    await completeBatch(batchId, response.ok ? 1 : 0, response.ok ? 0 : 1);
    
    res.json({ 
      success: response.ok, 
      data,
      statusCode: response.status,
      batchId
    });
  } catch (error) {
    console.error('SMS send error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Send bulk SMS (sequential with delay)
app.post('/api/sms/bulk', async (req, res) => {
  try {
    const { recipients, message, credentials, senderId, delay = 500 } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipients must be a non-empty array' 
      });
    }

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message is required' 
      });
    }

    const username = credentials?.username || process.env.SEMASMS_USERNAME;
    const password = credentials?.password || process.env.SEMASMS_PASSWORD;
    const sender = senderId || process.env.SEMASMS_SENDER_ID;

    if (!username || !password || !sender) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing API credentials or sender ID' 
      });
    }

    // Create batch record
    const batchId = await createBatch(sender, message, recipients.length);

    const results = {
      batchId,
      total: recipients.length,
      sent: 0,
      failed: 0,
      details: []
    };

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      try {
        const response = await fetch(SEMASMS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getAuthHeader(username, password)
          },
          body: JSON.stringify({
            sender,
            recipient,
            message,
            bulk: '1'
          })
        });

        const data = await response.text();

        if (response.ok) {
          results.sent++;
          results.details.push({ recipient, status: 'success', response: data });
          await saveSmsRecord(batchId, recipient, message, sender, 'success', data, null);
        } else {
          results.failed++;
          results.details.push({ recipient, status: 'failed', error: data });
          await saveSmsRecord(batchId, recipient, message, sender, 'failed', null, data);
        }
      } catch (error) {
        results.failed++;
        results.details.push({ recipient, status: 'failed', error: error.message });
        await saveSmsRecord(batchId, recipient, message, sender, 'failed', null, error.message);
      }

      // Add delay between messages (except for last one)
      if (i < recipients.length - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    // Update batch with final counts
    await completeBatch(batchId, results.sent, results.failed);

    res.json({ success: true, results });
  } catch (error) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============ HISTORY ENDPOINTS ============

// Get SMS statistics
app.get('/api/sms/stats', async (req, res) => {
  try {
    const stats = await getStatistics();
    const totalBatches = await getTotalBatches();
    const totalRecords = await getTotalRecords();
    
    res.json({
      success: true,
      data: {
        ...stats,
        totalBatches,
        totalRecords
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all batches
app.get('/api/sms/batches', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    
    const batches = await getSmsBatches(limit, offset);
    const total = await getTotalBatches();
    
    res.json({
      success: true,
      data: batches,
      pagination: { limit, offset, total }
    });
  } catch (error) {
    console.error('Batches error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get specific batch with its records
app.get('/api/sms/batches/:id', async (req, res) => {
  try {
    const batchId = parseInt(req.params.id);
    const batch = await getBatch(batchId);
    
    if (!batch) {
      return res.status(404).json({ success: false, error: 'Batch not found' });
    }
    
    const records = await getBatchRecords(batchId);
    
    res.json({
      success: true,
      data: { batch, records }
    });
  } catch (error) {
    console.error('Batch details error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all SMS records
app.get('/api/sms/records', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    
    const records = await getSmsRecords(limit, offset);
    const total = await getTotalRecords();
    
    res.json({
      success: true,
      data: records,
      pagination: { limit, offset, total }
    });
  } catch (error) {
    console.error('Records error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search records by recipient
app.get('/api/sms/search', async (req, res) => {
  try {
    const { recipient } = req.query;
    
    if (!recipient) {
      return res.status(400).json({ success: false, error: 'Recipient query required' });
    }
    
    const records = await searchByRecipient(recipient);
    
    res.json({
      success: true,
      data: records
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 SemaSMS Backend running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
