import { useState, useCallback } from 'react';

// In production (Docker), use relative URL since nginx proxies /api to backend
// In development, Vite proxy handles the /api requests
const API_BASE_URL = '';

export function useSMS() {
  const [isSending, setIsSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, percent: 0 });
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const sendBulkSMS = useCallback(async ({ recipients, message, credentials, senderId, delay = 500, onProgress }) => {
    setIsSending(true);
    setError(null);
    setProgress({ current: 0, total: recipients.length, percent: 0 });
    setResults(null);

    const resultData = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      details: []
    };

    try {
      for (let i = 0; i < recipients.length; i++) {
        const recipient = recipients[i];

        try {
          const response = await fetch(`${API_BASE_URL}/api/sms/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              recipient,
              message,
              credentials,
              senderId
            })
          });

          const data = await response.json();

          if (data.success) {
            resultData.sent++;
            resultData.details.push({ recipient, status: 'success', response: data.data });
          } else {
            resultData.failed++;
            resultData.details.push({ recipient, status: 'failed', error: data.error || data.data });
          }
        } catch (err) {
          resultData.failed++;
          resultData.details.push({ recipient, status: 'failed', error: err.message });
        }

        const currentProgress = {
          current: i + 1,
          total: recipients.length,
          percent: Math.round(((i + 1) / recipients.length) * 100),
          lastRecipient: recipient,
          lastStatus: resultData.details[i].status
        };

        setProgress(currentProgress);
        if (onProgress) onProgress(currentProgress);

        // Delay between messages (except for last one)
        if (i < recipients.length - 1) {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }

      setResults(resultData);
      return resultData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsSending(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSending(false);
    setProgress({ current: 0, total: 0, percent: 0 });
    setResults(null);
    setError(null);
  }, []);

  return {
    isSending,
    progress,
    results,
    error,
    sendBulkSMS,
    reset
  };
}

