import { useState, useEffect } from 'react';
import './SmsHistory.css';

const API_BASE_URL = '';

export function SmsHistory({ onClose }) {
  const [activeTab, setActiveTab] = useState('batches');
  const [batches, setBatches] = useState([]);
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load stats
      const statsRes = await fetch(`${API_BASE_URL}/api/sms/stats`);
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      if (activeTab === 'batches') {
        const batchesRes = await fetch(`${API_BASE_URL}/api/sms/batches?limit=50`);
        const batchesData = await batchesRes.json();
        if (batchesData.success) {
          setBatches(batchesData.data);
        }
      } else {
        const recordsRes = await fetch(`${API_BASE_URL}/api/sms/records?limit=100`);
        const recordsData = await recordsRes.json();
        if (recordsData.success) {
          setRecords(recordsData.data);
        }
      }
    } catch (err) {
      setError('Failed to load data. Make sure the backend is running.');
      console.error('Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const viewBatchDetails = async (batchId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sms/batches/${batchId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedBatch(data.data);
      }
    } catch (err) {
      console.error('Batch details error:', err);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      success: 'badge--success',
      completed: 'badge--success',
      failed: 'badge--error',
      partial: 'badge--warning',
      pending: 'badge--pending',
      sending: 'badge--pending'
    };
    return `badge ${statusClasses[status] || 'badge--pending'}`;
  };

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h2>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            SMS History
          </h2>
          <button className="close-btn" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{stats.totalRecords || 0}</span>
              <span className="stat-label">Total Messages</span>
            </div>
            <div className="stat-card stat-card--success">
              <span className="stat-value">{stats.allTime?.sent_messages || 0}</span>
              <span className="stat-label">Delivered</span>
            </div>
            <div className="stat-card stat-card--error">
              <span className="stat-value">{stats.allTime?.failed_messages || 0}</span>
              <span className="stat-label">Failed</span>
            </div>
            <div className="stat-card stat-card--info">
              <span className="stat-value">{stats.today?.total_messages || 0}</span>
              <span className="stat-label">Today</span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="history-tabs">
          <button
            className={`tab-btn ${activeTab === 'batches' ? 'active' : ''}`}
            onClick={() => { setActiveTab('batches'); setSelectedBatch(null); }}
          >
            Batches
          </button>
          <button
            className={`tab-btn ${activeTab === 'records' ? 'active' : ''}`}
            onClick={() => { setActiveTab('records'); setSelectedBatch(null); }}
          >
            All Records
          </button>
        </div>

        {/* Content */}
        <div className="history-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p>{error}</p>
              <button onClick={loadData}>Retry</button>
            </div>
          ) : selectedBatch ? (
            <div className="batch-details">
              <button className="back-btn" onClick={() => setSelectedBatch(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back to Batches
              </button>
              
              <div className="batch-info">
                <h3>Batch #{selectedBatch.batch.id}</h3>
                <p><strong>Sender:</strong> {selectedBatch.batch.sender_id}</p>
                <p><strong>Message:</strong> {selectedBatch.batch.message}</p>
                <p><strong>Date:</strong> {formatDate(selectedBatch.batch.created_at)}</p>
                <p>
                  <strong>Status:</strong> 
                  <span className={getStatusBadge(selectedBatch.batch.status)}>
                    {selectedBatch.batch.status}
                  </span>
                </p>
                <p><strong>Sent:</strong> {selectedBatch.batch.sent_count} / {selectedBatch.batch.total_recipients}</p>
              </div>

              <h4>Recipients ({selectedBatch.records.length})</h4>
              <div className="records-list">
                {selectedBatch.records.map((record, idx) => (
                  <div key={idx} className={`record-item record-item--${record.status}`}>
                    <span className="record-recipient">{record.recipient}</span>
                    <span className={getStatusBadge(record.status)}>{record.status}</span>
                    <span className="record-time">{formatDate(record.created_at)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'batches' ? (
            <div className="batches-list">
              {batches.length === 0 ? (
                <div className="empty-state">
                  <p>No batches found</p>
                </div>
              ) : (
                batches.map((batch) => (
                  <div key={batch.id} className="batch-card" onClick={() => viewBatchDetails(batch.id)}>
                    <div className="batch-card__header">
                      <span className="batch-id">Batch #{batch.id}</span>
                      <span className={getStatusBadge(batch.status)}>{batch.status}</span>
                    </div>
                    <p className="batch-message">{batch.message.substring(0, 80)}...</p>
                    <div className="batch-card__footer">
                      <span className="batch-stats">
                        <span className="success">{batch.sent_count}</span> / 
                        <span className="total"> {batch.total_recipients}</span>
                        {batch.failed_count > 0 && (
                          <span className="failed"> ({batch.failed_count} failed)</span>
                        )}
                      </span>
                      <span className="batch-date">{formatDate(batch.created_at)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="records-table-wrapper">
              {records.length === 0 ? (
                <div className="empty-state">
                  <p>No records found</p>
                </div>
              ) : (
                <table className="records-table">
                  <thead>
                    <tr>
                      <th>Recipient</th>
                      <th>Sender</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((record, idx) => (
                      <tr key={idx} className={`row--${record.status}`}>
                        <td>{record.recipient}</td>
                        <td>{record.sender_id}</td>
                        <td><span className={getStatusBadge(record.status)}>{record.status}</span></td>
                        <td>{formatDate(record.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


