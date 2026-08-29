import { celcomConfig, isCelcomConfigured, sendWithCelcom } from './celcom.js';
import { isSemaSmsConfigured, semaSmsConfig, sendWithSemaSms } from './semasms.js';

export const SMS_PROVIDERS = ['semasms', 'celcom'];

export function normalizeProvider(value) {
  const provider = String(value || process.env.SMS_DEFAULT_PROVIDER || 'semasms').toLowerCase();
  if (!SMS_PROVIDERS.includes(provider)) throw new Error('Unsupported SMS provider');
  return provider;
}

export function providerStatus() {
  return [
    { id: 'semasms', name: 'SemaSMS', configured: isSemaSmsConfigured() },
    { id: 'celcom', name: 'Celcom Africa', configured: isCelcomConfigured() },
  ];
}

export function assertProviderConfigured(provider) {
  const row = providerStatus().find((item) => item.id === provider);
  if (!row?.configured) throw new Error(`${row?.name || provider} is not configured`);
}

export function providerSender(provider) {
  return provider === 'celcom' ? celcomConfig().shortcode : semaSmsConfig().sender;
}

export function sendSms({ provider, recipient, message, fetchImpl }) {
  const selected = normalizeProvider(provider);
  assertProviderConfigured(selected);
  return selected === 'celcom'
    ? sendWithCelcom({ recipient, message, fetchImpl })
    : sendWithSemaSms({ recipient, message, fetchImpl });
}
