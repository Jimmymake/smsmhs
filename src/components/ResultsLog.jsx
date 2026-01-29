import { useRef, useEffect } from 'react';
import './ResultsLog.css';

export function ResultsLog({ details }) {
  const logRef = useRef(null);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [details]);

  if (!details || details.length === 0) return null;

  return (
    <div className="results-log">
      <h4 className="results-log__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        Delivery Log
      </h4>
      
      <div className="results-log__container" ref={logRef}>
        {details.map((item, index) => (
          <div
            key={`${item.recipient}-${index}`}
            className={`log-item ${item.status === 'success' ? 'log-item--success' : 'log-item--failed'}`}
          >
            <span className="log-item__icon">
              {item.status === 'success' ? '✓' : '✗'}
            </span>
            <span className="log-item__recipient">{item.recipient}</span>
            {item.error && (
              <span className="log-item__error">{item.error}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}






