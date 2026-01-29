import { useState } from 'react';
import './CredentialsForm.css';

export function CredentialsForm({ credentials, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (field) => (e) => {
    onChange({ ...credentials, [field]: e.target.value });
  };

  return (
    <div className="credentials-form">
      <h3 className="credentials-form__title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        API Credentials
      </h3>
      
      <div className="credentials-form__grid">
        <div className="form-group">
          <label className="form-label" htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-input"
            placeholder="Your SemaSMS username"
            value={credentials.username}
            onChange={handleChange('username')}
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Password</label>
          <div className="input-with-icon">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-input"
              placeholder="Your SemaSMS password"
              value={credentials.password}
              onChange={handleChange('password')}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="input-icon-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="senderId">Sender ID</label>
          <input
            type="text"
            id="senderId"
            className="form-input"
            placeholder="Your approved sender ID"
            value={credentials.senderId}
            onChange={handleChange('senderId')}
          />
          <span className="form-hint">The name that will appear as the sender</span>
        </div>
      </div>
    </div>
  );
}






