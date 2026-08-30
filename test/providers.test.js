import test from 'node:test';
import assert from 'node:assert/strict';
import { sendWithSemaSms } from '../providers/semasms.js';
import { normalizeProvider } from '../providers/index.js';
import {
  clearZeaWorldTokenCache,
  sendWithZeaWorld,
  toZeaWorldPhone,
} from '../providers/zeaworld.js';

test('SemaSMS client sends the documented Basic-auth payload', async (t) => {
  const keys = ['SEMASMS_API_URL', 'SEMASMS_USERNAME', 'SEMASMS_PASSWORD', 'SEMASMS_SENDER_ID'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  t.after(() => {
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  process.env.SEMASMS_API_URL = 'https://sms.example/send';
  process.env.SEMASMS_USERNAME = 'user-test';
  process.env.SEMASMS_PASSWORD = 'password-test';
  process.env.SEMASMS_SENDER_ID = 'TEST SENDER';

  let request;
  const result = await sendWithSemaSms({
    recipient: '254111818206',
    message: 'Hello',
    fetchImpl: async (url, options) => {
      request = { url, options };
      return {
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ message: 'accepted' }),
      };
    },
  });

  const payload = JSON.parse(request.options.body);
  assert.deepEqual(payload, {
    sender: 'TEST SENDER',
    recipient: '254111818206',
    message: 'Hello',
    bulk: '1',
  });
  assert.equal(request.options.headers.Authorization, `Basic ${Buffer.from('user-test:password-test').toString('base64')}`);
  assert.equal(result.ok, true);
});

test('provider selection accepts only configured provider identifiers', () => {
  assert.equal(normalizeProvider('SEMASMS'), 'semasms');
  assert.equal(normalizeProvider('ZEAWORLD'), 'zeaworld');
  assert.throws(() => normalizeProvider('unknown'), /Unsupported SMS provider/);
});

test('Zea World authenticates then sends the IMPALA LTD payload', async (t) => {
  const keys = ['ZEAWORLD_API_URL', 'ZEAWORLD_USERNAME', 'ZEAWORLD_PASSWORD', 'ZEAWORLD_SENDER_ID'];
  const previous = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  t.after(() => {
    clearZeaWorldTokenCache();
    for (const key of keys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
    }
  });
  process.env.ZEAWORLD_API_URL = 'https://sms.example';
  process.env.ZEAWORLD_USERNAME = 'impalapay';
  process.env.ZEAWORLD_PASSWORD = 'secret-test';
  process.env.ZEAWORLD_SENDER_ID = 'IMPALA LTD';
  clearZeaWorldTokenCache();

  const requests = [];
  const result = await sendWithZeaWorld({
    recipient: '0746158487',
    message: 'Test message',
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      if (url.endsWith('/accessToken')) {
        return { ok: true, status: 200, json: async () => ({ token: 'opaque-token' }) };
      }
      return { ok: true, status: 200, json: async () => ({ message: 'accepted' }) };
    },
  });

  assert.equal(requests.length, 2);
  assert.deepEqual(JSON.parse(requests[0].options.body), {
    username: 'impalapay',
    password: 'secret-test',
  });
  assert.deepEqual(JSON.parse(requests[1].options.body), {
    from: 'IMPALA LTD',
    to: '254746158487',
    message: 'Test message',
  });
  assert.equal(requests[1].options.headers.Authorization, 'Bearer opaque-token');
  assert.equal(result.ok, true);
});

test('Zea World phone normalization accepts Kenyan formats', () => {
  assert.equal(toZeaWorldPhone('254746158487'), '254746158487');
  assert.equal(toZeaWorldPhone('0746158487'), '254746158487');
  assert.throws(() => toZeaWorldPhone('1234'), /Invalid Kenyan mobile/);
});
