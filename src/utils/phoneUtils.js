/**
 * Format phone number to international format (Kenya)
 */
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

/**
 * Validate phone number (Kenyan format)
 */
export function isValidPhone(phone) {
  const formatted = formatPhoneNumber(phone);
  // Kenyan numbers: 254 + 9 digits (starting with 1 or 7)
  return /^254[17]\d{8}$/.test(formatted);
}

/**
 * Parse recipients from text input (one per line or comma-separated)
 */
export function parseRecipients(text) {
  return text
    .split(/[\n,]+/)
    .map(num => num.trim())
    .filter(num => num.length > 0)
    .map(formatPhoneNumber)
    .filter(isValidPhone);
}

/**
 * Get unique recipients
 */
export function uniqueRecipients(recipients) {
  return [...new Set(recipients)];
}

/**
 * Count invalid numbers from raw input
 */
export function countInvalidNumbers(text) {
  const lines = text
    .split(/[\n,]+/)
    .map(num => num.trim())
    .filter(num => num.length > 0);
  
  const valid = lines.filter(num => isValidPhone(num));
  return lines.length - valid.length;
}






