/**
 * Count characters and SMS segments
 * Standard SMS: 160 chars for single, 153 per segment for multi-part
 */
export function countSMS(message) {
  const length = message.length;
  let segments;
  
  if (length === 0) {
    segments = 0;
  } else if (length <= 160) {
    segments = 1;
  } else {
    segments = Math.ceil(length / 153);
  }
  
  return { length, segments };
}

/**
 * Format number with commas for display
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Calculate estimated cost (if you have SMS credits pricing)
 */
export function estimateCost(recipientCount, segments, costPerSMS = 1) {
  return recipientCount * segments * costPerSMS;
}






