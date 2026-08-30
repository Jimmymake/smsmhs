import { isSemaSmsConfigured, semaSmsConfig, sendWithSemaSms } from './semasms.js';
import { isZeaWorldConfigured, sendWithZeaWorld, zeaWorldConfig } from './zeaworld.js';

export const SMS_PROVIDERS = ['zeaworld', 'semasms'];

export function normalizeProvider(value) {
  const provider = String(value || process.env.SMS_DEFAULT_PROVIDER || 'zeaworld').toLowerCase();
  if (!SMS_PROVIDERS.includes(provider)) throw new Error('Unsupported SMS provider');
  return provider;
}

export function providerStatus() {
  return [
    { id: 'zeaworld', name: 'Zea World', configured: isZeaWorldConfigured() },
    { id: 'semasms', name: 'SemaSMS', configured: isSemaSmsConfigured() },
  ];
}

export function assertProviderConfigured(provider) {
  const row = providerStatus().find((item) => item.id === provider);
  if (!row?.configured) throw new Error(`${row?.name || provider} is not configured`);
}

export function providerSender(provider) {
  return provider === 'semasms' ? semaSmsConfig().sender : zeaWorldConfig().sender;
}

export function sendSms({ provider, recipient, message, fetchImpl }) {
  const selected = normalizeProvider(provider);
  assertProviderConfigured(selected);
  return selected === 'semasms'
    ? sendWithSemaSms({ recipient, message, fetchImpl })
    : sendWithZeaWorld({ recipient, message, fetchImpl });
}
