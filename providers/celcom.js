const DEFAULT_URL = 'https://isms.celcomafrica.com/api/services/sendsms/';

export function toCelcomMobile(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^254[17]\d{8}$/.test(digits)) return `0${digits.slice(3)}`;
  if (/^[17]\d{8}$/.test(digits)) return `0${digits}`;
  if (/^0[17]\d{8}$/.test(digits)) return digits;
  throw new Error('Invalid Kenyan mobile number');
}

export function celcomConfig(env = process.env) {
  return {
    url: env.CELCOM_API_URL || DEFAULT_URL,
    partnerId: env.CELCOM_PARTNER_ID || '',
    apiKey: env.CELCOM_API_KEY || '',
    shortcode: env.CELCOM_SHORTCODE || '',
    passType: env.CELCOM_PASS_TYPE || 'plain',
    phpSessionId: env.CELCOM_PHPSESSID || '',
  };
}

export function isCelcomConfigured(env = process.env) {
  const config = celcomConfig(env);
  return Boolean(config.partnerId && config.apiKey && config.shortcode);
}

function celcomAccepted(response, body) {
  if (!response.ok) return false;
  try {
    const data = JSON.parse(body);
    const item = Array.isArray(data.responses) ? data.responses[0] : data;
    const code = typeof item === 'string' || typeof item === 'number'
      ? item
      : item?.['response-code'] ?? item?.responseCode ?? item?.status;
    return code === undefined || ['0', '200', 'success', 'ok'].includes(String(code).toLowerCase());
  } catch {
    return true;
  }
}

export async function sendWithCelcom({ recipient, message, fetchImpl = fetch }) {
  const config = celcomConfig();
  if (!isCelcomConfigured()) throw new Error('Celcom credentials are not configured');

  const headers = { 'Content-Type': 'application/json' };
  if (config.phpSessionId) headers.Cookie = `PHPSESSID=${config.phpSessionId}`;

  const response = await fetchImpl(config.url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      partnerID: config.partnerId,
      apikey: config.apiKey,
      mobile: toCelcomMobile(recipient),
      message,
      shortcode: config.shortcode,
      pass_type: config.passType,
    }),
  });
  const body = await response.text();
  return {
    ok: celcomAccepted(response, body),
    statusCode: response.status,
    body,
    sender: config.shortcode,
  };
}
