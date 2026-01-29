import { formatNumber } from '../utils/smsUtils';
import './ResultsSummary.css';

export function ResultsSummary({ results }) {
  if (!results) return null;

  const successRate = results.total > 0 
    ? Math.round((results.sent / results.total) * 100) 
    : 0;

  return (
    <div className="results-summary">
      <h3 className="results-summary__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        Sending Complete
      </h3>
      
      <div className="results-summary__stats">
        <div className="result-stat result-stat--total">
          <span className="result-stat__number">{formatNumber(results.total)}</span>
          <span className="result-stat__label">Total</span>
        </div>
        
        <div className="result-stat result-stat--success">
          <span className="result-stat__number">{formatNumber(results.sent)}</span>
          <span className="result-stat__label">Sent</span>
        </div>
        
        <div className="result-stat result-stat--failed">
          <span className="result-stat__number">{formatNumber(results.failed)}</span>
          <span className="result-stat__label">Failed</span>
        </div>
        
        <div className="result-stat result-stat--rate">
          <span className="result-stat__number">{successRate}%</span>
          <span className="result-stat__label">Success Rate</span>
        </div>
      </div>
    </div>
  );
}






