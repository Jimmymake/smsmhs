import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const batchSchema = new mongoose.Schema({
  sender_id: { type: String, required: true, maxlength: 50 },
  message: { type: String, required: true },
  total_recipients: { type: Number, required: true },
  sent_count: { type: Number, default: 0 },
  failed_count: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'sending', 'completed', 'partial', 'failed'],
    default: 'pending'
  },
  completed_at: { type: Date, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

batchSchema.index({ created_at: -1 });
batchSchema.index({ status: 1 });

const recordSchema = new mongoose.Schema({
  batch_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SmsBatch',
    required: true,
    index: true
  },
  recipient: { type: String, required: true, maxlength: 20, index: true },
  message: { type: String, required: true },
  sender_id: { type: String, required: true, maxlength: 50 },
  status: {
    type: String,
    enum: ['success', 'failed', 'pending'],
    required: true,
    index: true
  },
  response: { type: String, default: null },
  error: { type: String, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

recordSchema.index({ created_at: -1 });

const SmsBatch = mongoose.model('SmsBatch', batchSchema);
const SmsRecord = mongoose.model('SmsRecord', recordSchema);

const contactSchema = new mongoose.Schema({
  recipient: { type: String, required: true, unique: true },
  send_count: { type: Number, default: 0 },
  last_sent_at: { type: Date, default: null }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

contactSchema.index({ last_sent_at: -1 });

const SmsContact = mongoose.model('SmsContact', contactSchema);

function serialize(document) {
  if (!document) return null;
  const value = document.toObject ? document.toObject() : { ...document };
  value.id = value._id.toString();
  delete value._id;
  delete value.__v;
  if (value.batch_id) value.batch_id = value.batch_id.toString();
  return value;
}

function validObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

export async function initDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/semasms_db';
  await mongoose.connect(mongoUri);
  await Promise.all([SmsBatch.init(), SmsRecord.init(), SmsContact.init()]);
  console.log('✅ MongoDB initialized successfully');
  return true;
}

export async function createBatch(senderId, message, totalRecipients) {
  const batch = await SmsBatch.create({
    sender_id: senderId,
    message,
    total_recipients: totalRecipients,
    status: 'sending'
  });
  return batch._id.toString();
}

export async function completeBatch(batchId, sentCount, failedCount) {
  let status = 'completed';
  if (failedCount > 0 && sentCount > 0) status = 'partial';
  else if (sentCount === 0) status = 'failed';

  await SmsBatch.findByIdAndUpdate(batchId, {
    sent_count: sentCount,
    failed_count: failedCount,
    status,
    completed_at: new Date()
  });
}

export async function saveSmsRecord(
  batchId,
  recipient,
  message,
  senderId,
  status,
  response = null,
  error = null
) {
  await SmsRecord.create({
    batch_id: batchId,
    recipient,
    message,
    sender_id: senderId,
    status,
    response,
    error
  });

  if (status === 'success') {
    await SmsContact.findOneAndUpdate(
      { recipient },
      {
        $set: { last_sent_at: new Date() },
        $inc: { send_count: 1 }
      },
      { upsert: true }
    );
  }
}

export async function getSmsBatches(limit = 50, offset = 0) {
  const rows = await SmsBatch.find()
    .sort({ created_at: -1 })
    .skip(Number(offset))
    .limit(Number(limit))
    .lean();
  return rows.map(serialize);
}

export async function getBatch(batchId) {
  if (!validObjectId(batchId)) return null;
  return serialize(await SmsBatch.findById(batchId).lean());
}

export async function getBatchRecords(batchId) {
  if (!validObjectId(batchId)) return [];
  const rows = await SmsRecord.find({ batch_id: batchId })
    .sort({ created_at: 1 })
    .lean();
  return rows.map(serialize);
}

export async function getSmsRecords(limit = 100, offset = 0) {
  const rows = await SmsRecord.find()
    .sort({ created_at: -1 })
    .skip(Number(offset))
    .limit(Number(limit))
    .lean();
  return rows.map(serialize);
}

async function aggregateStatistics(match = {}) {
  const [result] = await SmsRecord.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total_messages: { $sum: 1 },
        sent_messages: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        failed_messages: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } },
        batches: { $addToSet: '$batch_id' }
      }
    },
    {
      $project: {
        _id: 0,
        total_messages: 1,
        sent_messages: 1,
        failed_messages: 1,
        total_batches: { $size: '$batches' }
      }
    }
  ]);

  return result || {
    total_messages: 0,
    sent_messages: 0,
    failed_messages: 0,
    total_batches: 0
  };
}

export async function getStatistics() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const [allTime, today] = await Promise.all([
    aggregateStatistics(),
    aggregateStatistics({ created_at: { $gte: startOfToday } })
  ]);
  return { allTime, today };
}

export function getTotalBatches() {
  return SmsBatch.countDocuments();
}

export function getTotalRecords() {
  return SmsRecord.countDocuments();
}

export async function getSmsContacts(limit = 500, search = '') {
  const query = {};
  if (search) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.recipient = { $regex: escaped, $options: 'i' };
  }

  const rows = await SmsContact.find(query)
    .sort({ last_sent_at: -1 })
    .limit(Math.min(Number(limit) || 500, 1000))
    .lean();
  return rows.map(serialize);
}

export async function searchByRecipient(recipient, limit = 50) {
  const escaped = recipient.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const rows = await SmsRecord.find({ recipient: { $regex: escaped, $options: 'i' } })
    .sort({ created_at: -1 })
    .limit(Number(limit))
    .lean();
  return rows.map(serialize);
}

export async function getRecordsByDateRange(startDate, endDate, limit = 100) {
  const rows = await SmsRecord.find({
    created_at: { $gte: new Date(startDate), $lte: new Date(endDate) }
  })
    .sort({ created_at: -1 })
    .limit(Number(limit))
    .lean();
  return rows.map(serialize);
}

export default mongoose;
