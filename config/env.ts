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
    baseUrl: process.env.QA_BASE_URL ?? '',
    apiBaseUrl: process.env.QA_API_BASE_URL ?? '',
    user: process.env.QA_USER ?? '',
    password: process.env.QA_PASSWORD ?? '',
    apiLogin: process.env.QA_API_USER ?? '',
    apiPassword: process.env.QA_API_PASSWORD ?? '',
    apiKey: process.env.QA_API_KEY ?? '',
  },
  prod: {
    baseUrl: process.env.PROD_BASE_URL ?? '',
    apiBaseUrl: process.env.PROD_API_BASE_URL ?? '',
    user: process.env.PROD_USER ?? '',
    password: process.env.PROD_PASSWORD ?? '',
    apiLogin: process.env.PROD_API_USER ?? '',
    apiPassword: process.env.PROD_API_PASSWORD ?? '',
    apiKey: process.env.PROD_API_KEY ?? '',
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
