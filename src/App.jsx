import { useState, useEffect, useCallback } from 'react';
import {
  Header,
  CredentialsForm,
  RecipientsInput,
  MessageInput,
  SendButton,
  ProgressBar,
  ResultsSummary,
  ResultsLog,
  ThemeToggle,
  LoginPage,
  SmsHistory
} from './components';
import { useSMS } from './hooks/useSMS';
import { parseRecipients, uniqueRecipients } from './utils/phoneUtils';
import './App.css';

const STORAGE_KEY = 'semasms_config';
const THEME_KEY = 'semasms_theme';
const AUTH_KEY = 'semasms_auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    senderId: ''
  });
  const [recipients, setRecipients] = useState('');
  const [message, setMessage] = useState('');
  const [theme, setTheme] = useState('light');
  const [showHistory, setShowHistory] = useState(false);

  const { isSending, progress, results, sendBulkSMS, reset } = useSMS();

  // Check authentication on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem(AUTH_KEY);
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        setIsAuthenticated(true);
        setUser(authData);
      } catch (e) {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, []);

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  // Load saved credentials on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setCredentials(prev => ({
          ...prev,
          username: config.username || '',
          senderId: config.senderId || ''
        }));
      } catch (e) {
        console.error('Failed to load saved config:', e);
      }
    }
  }, []);

  // Handle login
  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  // Toggle theme
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }, [theme]);

  // Save credentials when they change (not password)
  const saveConfig = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      username: credentials.username,
      senderId: credentials.senderId
    }));
  }, [credentials.username, credentials.senderId]);

  const handleSend = async () => {
    const { username, password, senderId } = credentials;

    if (!username || !password || !senderId) {
      alert('Please fill in all API credentials');
      return;
    }

    const parsedRecipients = uniqueRecipients(parseRecipients(recipients));

    if (parsedRecipients.length === 0) {
      alert('Please enter at least one valid phone number');
      return;
    }

    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    // Save config before sending
    saveConfig();

    try {
      await sendBulkSMS({
        recipients: parsedRecipients,
        message: message.trim(),
        credentials: { username, password },
        senderId,
        delay: 900
      });
    } catch (error) {
      console.error('Failed to send SMS:', error);
      alert(`Failed to send SMS: ${error.message}`);
    }
  };

  const handleReset = () => {
    reset();
    setRecipients('');
    setMessage('');
  };

  const canSend = credentials.username && 
                  credentials.password && 
                  credentials.senderId && 
                  recipients.trim() && 
                  message.trim();

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        <LoginPage onLogin={handleLogin} />
      </>
    );
  }

  // Show SMS dashboard if authenticated
  return (
    <div className="app">
      <ThemeToggle theme={theme} onToggle={toggleTheme} />
      
      <div className="container">
        <div className="card">
          <div className="dashboard-header">
            <Header />
            <div className="header-actions">
              <button className="history-btn" onClick={() => setShowHistory(true)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                History
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          </div>

          <CredentialsForm
            credentials={credentials}
            onChange={setCredentials}
          />

          <RecipientsInput
            value={recipients}
            onChange={setRecipients}
          />

          <MessageInput
            value={message}
            onChange={setMessage}
          />

          <SendButton
            onClick={handleSend}
            disabled={!canSend}
            isSending={isSending}
          />

          {isSending && (
            <ProgressBar
              current={progress.current}
              total={progress.total}
              percent={progress.percent}
            />
          )}

          {results && (
            <>
              <ResultsSummary results={results} />
              <ResultsLog details={results.details} />
              
              <button
                type="button"
                className="btn-reset"
                onClick={handleReset}
              >
                Send Another Batch
              </button>
            </>
          )}
        </div>

        <footer className="footer">
          <p>Mam-laka Bulk Sender • Secure API</p>
        </footer>
      </div>

      {showHistory && <SmsHistory onClose={() => setShowHistory(false)} />}
    </div>
  );
}

export default App;
