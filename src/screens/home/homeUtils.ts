import { Platform } from 'react-native';

const localDevHostnames = new Set(['localhost', '127.0.0.1', '::1']);

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function isLocalhostDevWeb() {
  if (!__DEV__ || Platform.OS !== 'web') {
    return false;
  }

  const runtimeLocation = (
    globalThis as typeof globalThis & {
      location?: {
        hostname?: string;
      };
    }
  ).location;

  return localDevHostnames.has(runtimeLocation?.hostname ?? '');
}
