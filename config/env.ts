import * as dotenv from 'dotenv';
import * as path from 'path';

// Load the env file for the current TEST_ENV when running outside Docker.
// In Docker, variables are injected via --env-file so this is a no-op
// (dotenv never overwrites variables that are already set).
const testEnv = process.env.TEST_ENV ?? 'qa';
const envPath = path.resolve(__dirname, `.env.${testEnv}`);
const result = dotenv.config({ path: envPath, quiet: true, override: false });

if (result.error || !result.parsed || Object.keys(result.parsed).length === 0) {
  console.warn(
    `[env] Warning: no variables loaded from ${envPath}. Check the file exists and is not empty.`,
  );
}

export type EnvironmentName = 'qa' | 'prod';

type EnvConfig = {
  baseUrl: string;
  apiBaseUrl: string;
  user: string;
  password: string;
  apiLogin: string;
  apiPassword: string;
  apiKey: string;
};

const configs: Record<EnvironmentName, EnvConfig> = {
  qa: {
    baseUrl: process.env.BASE_URL ?? '',
    apiBaseUrl: process.env.API_BASE_URL ?? '',
    user: process.env.UI_USER ?? '',
    password: process.env.UI_PASSWORD ?? '',
    apiLogin: process.env.API_LOGIN ?? '',
    apiPassword: process.env.API_PASSWORD ?? '',
    apiKey: process.env.API_KEY ?? '',
  },
  prod: {
    baseUrl: process.env.BASE_URL ?? '',
    apiBaseUrl: process.env.API_BASE_URL ?? '',
    user: process.env.UI_USER ?? '',
    password: process.env.UI_PASSWORD ?? '',
    apiLogin: process.env.API_LOGIN ?? '',
    apiPassword: process.env.API_PASSWORD ?? '',
    apiKey: process.env.API_KEY ?? '',
  },
};

function resolveEnvName(): EnvironmentName {
  const raw = (process.env.TEST_ENV || 'qa') as EnvironmentName;
  if (!configs[raw]) {
    throw new Error(`Unknown TEST_ENV="${raw}". Allowed: qa | prod`);
  }
  return raw;
}

const currentEnv = resolveEnvName();

export const env = {
  name: currentEnv,
  ...configs[currentEnv],
};
