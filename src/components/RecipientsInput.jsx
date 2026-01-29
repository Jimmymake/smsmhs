import { useMemo } from 'react';
import { parseRecipients, uniqueRecipients, countInvalidNumbers } from '../utils/phoneUtils';
import './RecipientsInput.css';

export function RecipientsInput({ value, onChange }) {
  const stats = useMemo(() => {
    const parsed = parseRecipients(value);
    const unique = uniqueRecipients(parsed);
    const invalid = countInvalidNumbers(value);
    return { valid: unique.length, invalid, duplicates: parsed.length - unique.length };
  }, [value]);

  return (
    <div className="recipients-input">
      <label className="form-label" htmlFor="recipients">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Recipients
      </label>
      
      <textarea
        id="recipients"
        className="form-textarea recipients-input__textarea"
        placeholder="Enter phone numbers (one per line or comma-separated)

Example:
0712345678
0723456789
254734567890"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
      />
      
      <div className="recipients-input__stats">
        <span className="stat stat--valid">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {stats.valid} valid
        </span>
        {stats.invalid > 0 && (
          <span className="stat stat--invalid">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {stats.invalid} invalid
          </span>
        )}
        {stats.duplicates > 0 && (
          <span className="stat stat--warning">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {stats.duplicates} duplicates
          </span>
        )}
      </div>
    </div>
  );
}






