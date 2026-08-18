import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

import { getApiUrl } from '@/utils/env';

export const authClient = createAuthClient({
  baseURL: getApiUrl(),
  plugins: [
    // Expo plugin types lag behind better-auth core fetch typings.
    // @ts-expect-error TS2322 — getActions signature mismatch between packages
    expoClient({
      scheme: 'receiptrival',
      storagePrefix: 'receiptrival',
      storage: SecureStore,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

export function getCookie(): string {
  return (
    authClient as typeof authClient & { getCookie: () => string }
  ).getCookie();
}
