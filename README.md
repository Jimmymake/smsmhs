# SemaSMS Bulk SMS API Integration
sudo docker-compose up --build -d
A bulk SMS web application built with **vanilla JavaScript** and **SCSS** for sending messages to multiple recipients via the SemaSMS API.

## Tech Stack

- **JavaScript** (ES6+) - Frontend logic and API integration
- **SCSS** - Styling and responsive design
- **HTML5** - Structure

## Overview

This integration allows you to send SMS messages to multiple recipients by looping through a contact list. Each recipient receives the message individually through the SemaSMS portal API.

## Prerequisites

- A SemaSMS account with API credentials
- Valid sender ID (approved by SemaSMS)
- Sufficient SMS credits in your account
- SCSS compiler (or use VS Code Live Sass Compiler extension)

## API Endpoint

```
POST https://portal-api.semasms.co.ke/send
```

## Authentication

The API uses Basic Authentication. Your credentials should be Base64 encoded in the format `username:password`.

```javascript
Authorization: Basic <base64_encoded_credentials>
```

## Request Body Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sender | string | Yes | Your approved sender ID |
| recipient | string | Yes | Phone number in international format (e.g., 254XXXXXXXXX) |
| message | string | Yes | The SMS content to send |
| bulk | string | No | Set to "1" for bulk messaging |

## Project Structure

```
bulk-sms/
├── index.html
├── css/
│   └── style.css          # Compiled from SCSS
├── scss/
│   ├── style.scss         # Main SCSS file
│   ├── _variables.scss    # Colors, fonts, spacing
│   ├── _mixins.scss       # Reusable mixins
│   ├── _buttons.scss      # Button styles
│   ├── _forms.scss        # Form and input styles
│   └── _components.scss   # UI components
├── js/
│   ├── app.js             # Main application logic
│   ├── sms-sender.js      # SMS API integration
│   └── utils.js           # Helper functions
└── README.md
```

## SCSS Setup

### Variables (_variables.scss)

```scss
// Colors
$primary: #2563eb;
$primary-dark: #1d4ed8;
$success: #10b981;
$error: #ef4444;
$warning: #f59e0b;
$dark: #1f2937;
$gray: #6b7280;
$light: #f3f4f6;
$white: #ffffff;

// Typography
$font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;

// Spacing
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$spacing-xl: 32px;

// Border radius
$radius-sm: 4px;
$radius-md: 8px;
$radius-lg: 12px;

// Shadows
$shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
$shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
$shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Mixins (_mixins.scss)

```scss
// Flexbox
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// Responsive breakpoints
@mixin mobile {
  @media (max-width: 640px) {
    @content;
  }
}

@mixin tablet {
  @media (max-width: 768px) {
    @content;
  }
}

// Button base
@mixin button-base {
  padding: $spacing-sm $spacing-md;
  border: none;
  border-radius: $radius-md;
  font-family: $font-family;
  font-size: $font-size-base;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

// Input base
@mixin input-base {
  width: 100%;
  padding: $spacing-sm $spacing-md;
  border: 1px solid darken($light, 10%);
  border-radius: $radius-md;
  font-family: $font-family;
  font-size: $font-size-base;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }
}
```

### Main Styles (style.scss)

```scss
@import 'variables';
@import 'mixins';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: $font-family;
  font-size: $font-size-base;
  background: $light;
  color: $dark;
  line-height: 1.6;
}

// Container
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: $spacing-lg;
  
  @include mobile {
    padding: $spacing-md;
  }
}

// Card
.card {
  background: $white;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  padding: $spacing-xl;
  
  @include mobile {
    padding: $spacing-lg;
  }
}

// Header
.header {
  text-align: center;
  margin-bottom: $spacing-xl;
  
  &__title {
    font-size: 28px;
    font-weight: 700;
    color: $dark;
    margin-bottom: $spacing-xs;
  }
  
  &__subtitle {
    color: $gray;
    font-size: $font-size-sm;
  }
}

// Form
.form {
  &__group {
    margin-bottom: $spacing-lg;
  }
  
  &__label {
    display: block;
    font-weight: 500;
    margin-bottom: $spacing-sm;
    color: $dark;
  }
  
  &__input {
    @include input-base;
  }
  
  &__textarea {
    @include input-base;
    min-height: 120px;
    resize: vertical;
  }
}

// Recipients
.recipients {
  &__input {
    @include input-base;
    min-height: 150px;
    resize: vertical;
    font-family: monospace;
  }
  
  &__count {
    @include flex-between;
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
    color: $gray;
  }
}

// Buttons
.btn {
  @include button-base;
  
  &--primary {
    background: $primary;
    color: $white;
    
    &:hover:not(:disabled) {
      background: $primary-dark;
    }
  }
  
  &--success {
    background: $success;
    color: $white;
  }
  
  &--block {
    width: 100%;
    padding: $spacing-md;
    font-size: $font-size-lg;
  }
}

// Progress
.progress {
  margin-top: $spacing-xl;
  
  &__bar {
    height: 8px;
    background: $light;
    border-radius: $radius-sm;
    overflow: hidden;
    
    &-fill {
      height: 100%;
      background: $primary;
      border-radius: $radius-sm;
      transition: width 0.3s ease;
    }
  }
  
  &__text {
    @include flex-between;
    margin-top: $spacing-sm;
    font-size: $font-size-sm;
    color: $gray;
  }
}

// Results
.results {
  margin-top: $spacing-xl;
  
  &__summary {
    @include flex-center;
    gap: $spacing-xl;
    padding: $spacing-lg;
    background: $light;
    border-radius: $radius-md;
    
    @include mobile {
      flex-direction: column;
      gap: $spacing-md;
    }
  }
  
  &__stat {
    text-align: center;
    
    &-number {
      font-size: 32px;
      font-weight: 700;
    }
    
    &-label {
      font-size: $font-size-sm;
      color: $gray;
    }
    
    &--success .results__stat-number {
      color: $success;
    }
    
    &--failed .results__stat-number {
      color: $error;
    }
  }
  
  &__log {
    margin-top: $spacing-lg;
    max-height: 300px;
    overflow-y: auto;
    font-family: monospace;
    font-size: $font-size-sm;
    background: $dark;
    color: $light;
    padding: $spacing-md;
    border-radius: $radius-md;
  }
  
  &__log-item {
    padding: $spacing-xs 0;
    
    &--success {
      color: $success;
    }
    
    &--failed {
      color: $error;
    }
  }
}

// Status badge
.status {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  border-radius: $radius-sm;
  font-size: 12px;
  font-weight: 500;
  
  &--sending {
    background: rgba($warning, 0.1);
    color: $warning;
  }
  
  &--complete {
    background: rgba($success, 0.1);
    color: $success;
  }
}
```

## Bulk SMS Implementation

### SMS Sender Module (js/sms-sender.js)

```javascript
class SMSSender {
  constructor(config) {
    this.credentials = config.credentials;
    this.senderId = config.senderId;
    this.apiUrl = 'https://portal-api.semasms.co.ke/send';
    this.delay = config.delay || 500;
  }

  getHeaders() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Basic ${this.credentials}`);
    return headers;
  }

  async sendSingle(recipient, message) {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        sender: this.senderId,
        recipient: recipient,
        message: message,
        bulk: '1'
      }),
      redirect: 'follow'
    });

    return await response.text();
  }

  async sendBulk(recipients, message, callbacks = {}) {
    const { onProgress, onComplete, onError } = callbacks;
    
    const results = {
      total: recipients.length,
      sent: 0,
      failed: 0,
      details: []
    };

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];

      try {
        const response = await this.sendSingle(recipient, message);
        results.sent++;
        results.details.push({ 
          recipient, 
          status: 'success', 
          response 
        });
      } catch (error) {
        results.failed++;
        results.details.push({ 
          recipient, 
          status: 'failed', 
          error: error.message 
        });
        
        if (onError) onError(recipient, error);
      }

      if (onProgress) {
        onProgress({
          current: i + 1,
          total: recipients.length,
          percent: Math.round(((i + 1) / recipients.length) * 100),
          lastRecipient: recipient,
          lastStatus: results.details[i].status
        });
      }

      // Delay between messages
      if (i < recipients.length - 1) {
        await this.sleep(this.delay);
      }
    }

    if (onComplete) onComplete(results);
    
    return results;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default SMSSender;
```

### Utility Functions (js/utils.js)

```javascript
// Format Kenyan phone numbers to international format
export function formatPhoneNumber(phone) {
  // Remove spaces, dashes, plus signs, and parentheses
  phone = phone.replace(/[\s\-\+\(\)]/g, '');
  
  // Convert 07XX to 2547XX
  if (phone.startsWith('07')) {
    return '254' + phone.substring(1);
  }
  
  // Convert 7XX to 2547XX
  if (phone.startsWith('7') && phone.length === 9) {
    return '254' + phone;
  }
  
  // Convert 01XX to 2541XX (Safaricom landline)
  if (phone.startsWith('01')) {
    return '254' + phone.substring(1);
  }
  
  return phone;
}

// Validate phone number
export function isValidPhone(phone) {
  const formatted = formatPhoneNumber(phone);
  // Kenyan numbers: 254 + 9 digits
  return /^254[17]\d{8}$/.test(formatted);
}

// Parse recipients from textarea (one per line or comma-separated)
export function parseRecipients(text) {
  return text
    .split(/[\n,]+/)
    .map(num => num.trim())
    .filter(num => num.length > 0)
    .map(formatPhoneNumber)
    .filter(isValidPhone);
}

// Get unique recipients
export function uniqueRecipients(recipients) {
  return [...new Set(recipients)];
}

// Count characters and SMS segments
export function countSMS(message) {
  const length = message.length;
  let segments;
  
  if (length <= 160) {
    segments = 1;
  } else {
    segments = Math.ceil(length / 153);
  }
  
  return { length, segments };
}

// Format number with commas
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}
```

### Main Application (js/app.js)

```javascript
import SMSSender from './sms-sender.js';
import { parseRecipients, uniqueRecipients, countSMS, formatNumber } from './utils.js';

class BulkSMSApp {
  constructor() {
    this.sender = null;
    this.isSending = false;
    
    this.elements = {
      credentialsInput: document.getElementById('credentials'),
      senderIdInput: document.getElementById('senderId'),
      recipientsInput: document.getElementById('recipients'),
      messageInput: document.getElementById('message'),
      sendBtn: document.getElementById('sendBtn'),
      recipientCount: document.getElementById('recipientCount'),
      charCount: document.getElementById('charCount'),
      smsCount: document.getElementById('smsCount'),
      progressSection: document.getElementById('progressSection'),
      progressBar: document.getElementById('progressBar'),
      progressText: document.getElementById('progressText'),
      resultsSection: document.getElementById('resultsSection'),
      sentCount: document.getElementById('sentCount'),
      failedCount: document.getElementById('failedCount'),
      resultsLog: document.getElementById('resultsLog')
    };
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSavedConfig();
  }

  bindEvents() {
    // Update recipient count
    this.elements.recipientsInput.addEventListener('input', () => {
      this.updateRecipientCount();
    });
    
    // Update character/SMS count
    this.elements.messageInput.addEventListener('input', () => {
      this.updateMessageCount();
    });
    
    // Send button
    this.elements.sendBtn.addEventListener('click', () => {
      this.startSending();
    });
  }

  updateRecipientCount() {
    const recipients = parseRecipients(this.elements.recipientsInput.value);
    const unique = uniqueRecipients(recipients);
    this.elements.recipientCount.textContent = `${unique.length} valid recipients`;
  }

  updateMessageCount() {
    const { length, segments } = countSMS(this.elements.messageInput.value);
    this.elements.charCount.textContent = `${length} characters`;
    this.elements.smsCount.textContent = `${segments} SMS${segments > 1 ? 's' : ''} per recipient`;
  }

  loadSavedConfig() {
    const saved = localStorage.getItem('smsConfig');
    if (saved) {
      const config = JSON.parse(saved);
      this.elements.credentialsInput.value = config.credentials || '';
      this.elements.senderIdInput.value = config.senderId || '';
    }
  }

  saveConfig() {
    const config = {
      credentials: this.elements.credentialsInput.value,
      senderId: this.elements.senderIdInput.value
    };
    localStorage.setItem('smsConfig', JSON.stringify(config));
  }

  async startSending() {
    if (this.isSending) return;
    
    // Validate inputs
    const credentials = this.elements.credentialsInput.value.trim();
    const senderId = this.elements.senderIdInput.value.trim();
    const message = this.elements.messageInput.value.trim();
    const recipients = uniqueRecipients(
      parseRecipients(this.elements.recipientsInput.value)
    );

    if (!credentials || !senderId) {
      alert('Please enter your API credentials and Sender ID');
      return;
    }

    if (recipients.length === 0) {
      alert('Please enter at least one valid recipient');
      return;
    }

    if (!message) {
      alert('Please enter a message');
      return;
    }

    // Save config
    this.saveConfig();

    // Initialize sender
    this.sender = new SMSSender({ credentials, senderId });
    
    // Update UI
    this.isSending = true;
    this.elements.sendBtn.disabled = true;
    this.elements.sendBtn.textContent = 'Sending...';
    this.elements.progressSection.style.display = 'block';
    this.elements.resultsSection.style.display = 'none';
    this.elements.resultsLog.innerHTML = '';

    // Send messages
    await this.sender.sendBulk(recipients, message, {
      onProgress: (progress) => this.updateProgress(progress),
      onComplete: (results) => this.showResults(results)
    });

    // Reset UI
    this.isSending = false;
    this.elements.sendBtn.disabled = false;
    this.elements.sendBtn.textContent = 'Send Bulk SMS';
  }

  updateProgress(progress) {
    this.elements.progressBar.style.width = `${progress.percent}%`;
    this.elements.progressText.textContent = 
      `${progress.current} of ${progress.total} (${progress.percent}%)`;
    
    // Add to log
    const statusClass = progress.lastStatus === 'success' ? 'results__log-item--success' : 'results__log-item--failed';
    const icon = progress.lastStatus === 'success' ? '✓' : '✗';
    this.elements.resultsLog.innerHTML += 
      `<div class="${statusClass}">${icon} ${progress.lastRecipient}</div>`;
    
    // Auto-scroll log
    this.elements.resultsLog.scrollTop = this.elements.resultsLog.scrollHeight;
  }

  showResults(results) {
    this.elements.resultsSection.style.display = 'block';
    this.elements.sentCount.textContent = formatNumber(results.sent);
    this.elements.failedCount.textContent = formatNumber(results.failed);
  }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  new BulkSMSApp();
});
```

```

### HTML Template (index.html)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bulk SMS Sender</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <div class="container">
    <div class="card">
      <header class="header">
        <h1 class="header__title">Bulk SMS Sender</h1>
        <p class="header__subtitle">Send messages to multiple recipients</p>
      </header>

      <div class="form">
        <div class="form__group">
          <label class="form__label" for="credentials">API Credentials (Base64)</label>
          <input type="password" id="credentials" class="form__input" placeholder="Enter your Base64 credentials">
        </div>

        <div class="form__group">
          <label class="form__label" for="senderId">Sender ID</label>
          <input type="text" id="senderId" class="form__input" placeholder="Your approved sender ID">
        </div>

        <div class="form__group">
          <label class="form__label" for="recipients">Recipients</label>
          <textarea id="recipients" class="recipients__input" placeholder="Enter phone numbers (one per line or comma-separated)&#10;&#10;Example:&#10;0712345678&#10;0723456789&#10;254734567890"></textarea>
          <div class="recipients__count">
            <span id="recipientCount">0 valid recipients</span>
          </div>
        </div>

        <div class="form__group">
          <label class="form__label" for="message">Message</label>
          <textarea id="message" class="form__textarea" placeholder="Type your message here..."></textarea>
          <div class="recipients__count">
            <span id="charCount">0 characters</span>
            <span id="smsCount">0 SMS per recipient</span>
          </div>
        </div>

        <button id="sendBtn" class="btn btn--primary btn--block">
          Send Bulk SMS
        </button>
      </div>

      <div id="progressSection" class="progress" style="display: none;">
        <div class="progress__bar">
          <div id="progressBar" class="progress__bar-fill" style="width: 0%"></div>
        </div>
        <div class="progress__text">
          <span id="progressText">0 of 0 (0%)</span>
          <span class="status status--sending">Sending...</span>
        </div>
      </div>

      <div id="resultsSection" class="results" style="display: none;">
        <div class="results__summary">
          <div class="results__stat results__stat--success">
            <div class="results__stat-number" id="sentCount">0</div>
            <div class="results__stat-label">Sent</div>
          </div>
          <div class="results__stat results__stat--failed">
            <div class="results__stat-number" id="failedCount">0</div>
            <div class="results__stat-label">Failed</div>
          </div>
        </div>
        <div id="resultsLog" class="results__log"></div>
      </div>
    </div>
  </div>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

## Phone Number Format

Ensure all phone numbers are in international format:

| Country | Format | Example |
|---------|--------|---------|
| Kenya | 254XXXXXXXXX | 254712345678 |
| Uganda | 256XXXXXXXXX | 256712345678 |
| Tanzania | 255XXXXXXXXX | 255712345678 |

```javascript
// Helper function to format Kenyan numbers
function formatKenyanNumber(phone) {
  // Remove spaces, dashes, and plus signs
  phone = phone.replace(/[\s\-\+]/g, '');
  
  // Convert 07XX to 2547XX
  if (phone.startsWith('07')) {
    return '254' + phone.substring(1);
  }
  
  // Convert 7XX to 2547XX
  if (phone.startsWith('7') && phone.length === 9) {
    return '254' + phone;
  }
  
  return phone;
}
```

## Best Practices

1. **Add delays between messages** - The examples include 500ms delays to avoid rate limiting
2. **Track results** - Log successful and failed sends for follow-up
3. **Validate numbers** - Format and validate phone numbers before sending
4. **Store credentials securely** - Use environment variables, never hardcode
5. **Handle errors gracefully** - Implement retry logic for failed sends
6. **Test with small batches first** - Verify everything works before large sends

## SCSS Compilation

### Using Node.js (sass package)

```bash
# Install sass
npm install -g sass

# Compile once
sass scss/style.scss css/style.css

# Watch for changes
sass --watch scss/style.scss:css/style.css
```

### Using VS Code

1. Install "Live Sass Compiler" extension
2. Click "Watch Sass" in the status bar
3. SCSS files auto-compile on save

### Package.json Scripts

```json
{
  "scripts": {
    "sass": "sass scss/style.scss css/style.css",
    "sass:watch": "sass --watch scss/style.scss:css/style.css",
    "sass:prod": "sass scss/style.scss css/style.css --style=compressed"
  }
}
```

## Security Note

⚠️ **Important:** Never expose your API credentials in client-side JavaScript. For production, use a backend server to make API calls and keep your credentials secure.

```javascript
// Example using environment variables (Node.js backend)
const credentials = process.env.SEMASMS_CREDENTIALS;
const senderId = process.env.SEMASMS_SENDER_ID;
```

## Support

For API issues or account inquiries, contact SemaSMS support through their portal.

---

## License

This integration example is provided as-is for educational purposes.
