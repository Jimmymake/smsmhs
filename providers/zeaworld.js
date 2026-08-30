const DEFAULT_BASE_URL = 'https://smsapi.zeaworldke.com';

let cachedToken = null;
let tokenExpiresAt = 0;

export function zeaWorldConfig(env = process.env) {
  return {
    baseUrl: (env.ZEAWORLD_API_URL || DEFAULT_BASE_URL).replace(/\/$/, ''),
    username: env.ZEAWORLD_USERNAME || '',
    password: env.ZEAWORLD_PASSWORD || '',
    sender: env.ZEAWORLD_SENDER_ID || '',
  };
}

export function isZeaWorldConfigured(env = process.env) {
  const config = zeaWorldConfig(env);
  return Boolean(config.username && config.password && config.sender);
}

export function toZeaWorldPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (/^254[17]\d{8}$/.test(digits)) return digits;
  if (/^0[17]\d{8}$/.test(digits)) return `254${digits.slice(1)}`;
  if (/^[17]\d{8}$/.test(digits)) return `254${digits}`;
  throw new Error('Invalid Kenyan mobile number');
}

export function extractZeaWorldToken(data) {
  return data?.accessToken
    || data?.access_token
    || data?.token
    || data?.data?.accessToken
    || data?.data?.access_token
    || data?.data?.token;
}

const tokenExpiry = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    if (Number.isFinite(payload.exp)) return payload.exp * 1000;
  } catch {
    // Zea World may return an opaque token.
  }
  return Date.now() + 50 * 60 * 1000;
};

const requestToken = async (config, fetchImpl) => {
  const response = await fetchImpl(`${config.baseUrl}/api/client/accessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: config.username, password: config.password }),
  });
  const body = await response.json().catch(() => ({}));
  const token = extractZeaWorldToken(body);
  if (!response.ok || !token) throw new Error(body.message || body.error || 'Zea World authentication failed');
  cachedToken = token;
  tokenExpiresAt = tokenExpiry(token);
  return token;
};

const accessToken = (config, fetchImpl) =>
  cachedToken && Date.now() < tokenExpiresAt - 30_000
    ? Promise.resolve(cachedToken)
    : requestToken(config, fetchImpl);

const sendRequest = async (config, recipient, message, token, fetchImpl) => {
  const response = await fetchImpl(`${config.baseUrl}/api/client/sms`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      from: config.sender,
      to: toZeaWorldPhone(recipient),
      message,
    }),
  });
  const body = await response.json().catch(() => ({}));
  return { response, body };
};

export async function sendWithZeaWorld({ recipient, message, fetchImpl = fetch }) {
  const config = zeaWorldConfig();
  if (!isZeaWorldConfigured()) throw new Error('Zea World credentials are not configured');

  let result = await sendRequest(config, recipient, message, await accessToken(config, fetchImpl), fetchImpl);
  if ([401, 403].includes(result.response.status)) {
    cachedToken = null;
    tokenExpiresAt = 0;
    result = await sendRequest(config, recipient, message, await requestToken(config, fetchImpl), fetchImpl);
  }
  if (!result.response.ok) {
    throw new Error(result.body.message || result.body.error || 'Zea World SMS request failed');
  }
  return {
    ok: true,
    statusCode: result.response.status,
    body: result.body,
    sender: config.sender,
  };
}

export function clearZeaWorldTokenCache() {
  cachedToken = null;
  tokenExpiresAt = 0;
}
