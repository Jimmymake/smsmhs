import { useState } from 'react';
import './LoginPage.css';

export function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate a small delay for UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Admin credentials from environment variables
    const validUsers = [
      {
        user: import.meta.env.VITE_ADMIN_USER_1 || 'jasmin@mam-laka.com',
        pass: import.meta.env.VITE_ADMIN_PASS_1 || '@mam-laka2026.'
      },
      {
        user: import.meta.env.VITE_ADMIN_USER_2 || 'jimmy@mam-laka.com',
        pass: import.meta.env.VITE_ADMIN_PASS_2 || '@jimmy123'
      },
      {
        user: import.meta.env.VITE_ADMIN_USER_2 || 'rose@mam-laka.com',
        pass: import.meta.env.VITE_ADMIN_PASS_2 || '@mam-laka2026.'
      }
    ];

    const isValid = validUsers.some(cred => cred.user === username && cred.pass === password);

    if (isValid) {
      onLogin({ username });
    } else {
      setError('Invalid username or password');
    }

    setIsLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Hero Section */}
        <div className="login-hero">
          <div className="login-logo">
            <div className="login-logo__icon">
              <img src="/mamlaka logo.png" alt="Mam-laka Bulk SMS" />

            </div>
            <h1 className="login-logo__text">Mam-laka Bulk SMS</h1>
            <span className="login-logo__tagline">Bulk SMS Platform</span>
          </div>

          <div className="login-features">
            <h2 className="login-features__title">Powerful SMS Solutions</h2>
            <ul className="login-features__list">
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Send bulk SMS to thousands of recipients instantly</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Real-time delivery tracking and reports</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Automatic phone number validation</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Secure API integration with SemaSMS</span>
              </li>
              <li>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Support for Kenyan mobile networks</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Login Form */}
        <div className="login-form-wrapper">
          <div className="login-card">
            <div className="login-card__header">
              <h2>Welcome Back</h2>
              <p>Sign in to access your dashboard</p>
            </div>

            <form className="login-form" onSubmit={handleSubmit}>
              {error && (
                <div className="login-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              <div className="login-form__group">
                <label htmlFor="login-username">Username</label>
                <div className="login-input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <input
                    type="text"
                    id="login-username"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="login-form__group">
                <label htmlFor="login-password">Password</label>
                <div className="login-input-wrapper">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="password"
                    id="login-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={isLoading || !username || !password}
              >
                {isLoading ? (
                  <>
                    <span className="login-btn__spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <p>&copy; 2026 Mam-laka. All rights reserved.</p>
        <p>Powered by SemaSMS API</p>
      </footer>
    </div>
  );
}

