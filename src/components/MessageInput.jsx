import { useMemo } from 'react';
import { countSMS } from '../utils/smsUtils';
import './MessageInput.css';

export function MessageInput({ value, onChange }) {
  const { length, segments } = useMemo(() => countSMS(value), [value]);

  return (
    <div className="message-input">
      <label className="form-label" htmlFor="message">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        Message
      </label>
      
      <textarea
        id="message"
        className="form-textarea message-input__textarea"
        placeholder="Type your message here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
      />
      
      <div className="message-input__stats">
        <span className={`char-count ${length > 160 ? 'char-count--multipart' : ''}`}>
          {length} / {length <= 160 ? 160 : Math.ceil(length / 153) * 153} characters
        </span>
        <span className="sms-count">
          {segments} SMS{segments !== 1 ? 's' : ''} per recipient
        </span>
      </div>
    </div>
  );
}






