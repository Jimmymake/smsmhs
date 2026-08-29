import test from 'node:test';
import assert from 'node:assert/strict';
import { sendWithCelcom, toCelcomMobile } from '../providers/celcom.js';
import { normalizeProvider } from '../providers/index.js';

test('Celcom phone normalization accepts Kenyan 07 and 01 ranges', () => {
  assert.equal(toCelcomMobile('254717126550'), '0717126550');
  assert.equal(toCelcomMobile('0111818206'), '0111818206');
  assert.throws(() => toCelcomMobile('1234'), /Invalid Kenyan mobile/);
});

test('Celcom client sends the documented payload without requiring a cookie', async (t) => {
  const keys = [
    'CELCOM_PARTNER_ID',
    'CELCOM_API_KEY',
    'CELCOM_SHORTCODE',
    'CELCOM_PASS_TYPE',
    'CELCOM_PHPSESSID',
  ];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  process.env.CELCOM_PARTNER_ID = 'partner-test';
  process.env.CELCOM_API_KEY = 'key-test';
  process.env.CELCOM_SHORTCODE = 'TEST SENDER';
  process.env.CELCOM_PASS_TYPE = 'plain';
  delete process.env.CELCOM_PHPSESSID;

  let request;
  const result = await sendWithCelcom({
    recipient: '254111818206',
    message: 'Hello',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ responses: [{ 'response-code': 200 }] }),
      };
    },
  });

  const payload = JSON.parse(request.options.body);
  assert.equal(payload.mobile, '0111818206');
  assert.equal(payload.partnerID, 'partner-test');
  assert.equal(payload.apikey, 'key-test');
  assert.equal(payload.shortcode, 'TEST SENDER');
  assert.equal(request.options.headers.Cookie, undefined);
  assert.equal(result.ok, true);
});

test('provider selection accepts only configured provider identifiers', () => {
  assert.equal(normalizeProvider('CELCOM'), 'celcom');
  assert.equal(normalizeProvider('semasms'), 'semasms');
  assert.throws(() => normalizeProvider('unknown'), /Unsupported SMS provider/);
});
