import type { APIRequestContext } from '@playwright/test';
import { test as base, expect } from '@playwright/test';

import { allureApi } from './allure-api.client';
import { createApiContext } from './createApiContext';
import { ScenarioContext } from '../test-context/scenarioContext';

type Fixtures = {
  ctx: ScenarioContext;
  api: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  ctx: async ({ page: _page }, use) => {
    await use(new ScenarioContext());
  },

  api: async ({ request: _request }, use) => {
    const rawContext = await createApiContext();
    await use(allureApi(rawContext));
    await rawContext.dispose();
  },
});

export { expect };
