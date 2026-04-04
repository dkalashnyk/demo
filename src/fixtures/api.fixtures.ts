import { test as base, expect, APIRequestContext } from '@playwright/test';

import { createApiContext } from './createApiContext';
import { playwrightApi } from './api.client';

type ApiFixtures = {
  api: APIRequestContext;
};

export const test = base.extend<ApiFixtures>({
  api: async ({ request: _request }, use) => {
    const rawContext = await createApiContext();
    await use(playwrightApi(rawContext));
    await rawContext.dispose();
  },
});

export { expect };
