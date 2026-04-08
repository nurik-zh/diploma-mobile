import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Backend: server/src/index.ts → PORT || 5002 */
const DEFAULT_PORT = 5002;

/** "192.168.1.5:8081" → "192.168.1.5" */
function hostWithoutPort(hostUri: string): string {
  const i = hostUri.lastIndexOf(':');
  if (i <= 0) return hostUri;
  const after = hostUri.slice(i + 1);
  if (/^\d+$/.test(after)) return hostUri.slice(0, i);
  return hostUri;
}

/**
 * В Expo Go при `expo start` в hostUri попадает IP ПК с Metro (тот же, что нужен для API).
 * Тогда телефон в той же Wi‑Fi сети достучится до бэкенда без .env.
 */
function apiBaseFromExpoHost(): string | null {
  const raw =
    Constants.expoConfig?.hostUri ??
    (Constants as { manifest?: { hostUri?: string } | null }).manifest?.hostUri;
  if (!raw || typeof raw !== 'string') return null;
  const host = hostWithoutPort(raw);
  if (!host || host === 'localhost' || host === '127.0.0.1') return null;
  return `http://${host}:${DEFAULT_PORT}`;
}

export function getApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) return fromEnv;

  const fromExpo = apiBaseFromExpoHost();
  if (fromExpo) return fromExpo;

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_PORT}`;
  }
  return `http://localhost:${DEFAULT_PORT}`;
}

export const API_BASE_URL = getApiBaseUrl();
