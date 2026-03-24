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
