import fs from 'fs';
import { request } from '@playwright/test';

import { env } from '../../config/env';

export async function createApiContext() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'x-api-key': env.apiKey, //static
  };

  try {
    const saved = JSON.parse(fs.readFileSync('playwright/.auth/api.json', 'utf-8'));
    if (saved.token) {
      headers['Authorization'] = `Bearer ${saved.token}`;
    }
  } catch {
    // No saved token, proceed without it
  }

  return request.newContext({
    baseURL: env.apiBaseUrl,
    extraHTTPHeaders: headers,
  });
}
