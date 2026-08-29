const DEFAULT_URL = 'https://portal-api.semasms.co.ke/send';

const authHeader = (username, password) =>
  `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;

export function semaSmsConfig(env = process.env) {
  return {
    url: env.SEMASMS_API_URL || DEFAULT_URL,
    username: env.SEMASMS_USERNAME || '',
    password: env.SEMASMS_PASSWORD || '',
    sender: env.SEMASMS_SENDER_ID || '',
  };
}

export function isSemaSmsConfigured(env = process.env) {
  const config = semaSmsConfig(env);
  return Boolean(config.username && config.password && config.sender);
}

export async function sendWithSemaSms({ recipient, message, fetchImpl = fetch }) {
  const config = semaSmsConfig();
  if (!isSemaSmsConfigured()) throw new Error('SemaSMS credentials are not configured');

  const response = await fetchImpl(config.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader(config.username, config.password),
    },
    body: JSON.stringify({
      sender: config.sender,
      recipient,
      message,
      bulk: '1',
    }),
  });
  const body = await response.text();
  return { ok: response.ok, statusCode: response.status, body, sender: config.sender };
}
