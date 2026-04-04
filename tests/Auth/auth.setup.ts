import fs from 'fs';

import { ENDPOINTS } from '../../src/api/endpoints';
import { test as setup, expect } from '../../src/fixtures/test';
import annotations from '../../src/utils/annotations';
import { createApiContext } from '../../src/fixtures/createApiContext';
import { LoginPage } from '../../src/pages/LoginPage';
import { ProductsPage } from '../../src/pages/ProductsPage';
import { env } from '../../config/env';

const UI_AUTH_FILE = 'playwright/.auth/ui.json';
const API_AUTH_FILE = 'playwright/.auth/api.json';

setup('Auth UI', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const productsPage = new ProductsPage(page);

  await annotations.step('User opens login page', async () => {
    await loginPage.open();
  });

  await annotations.step('User signs in', async () => {
    await loginPage.login(env.user, env.password);
    await productsPage.assertOnProductsPage();
  });

  await page.context().storageState({ path: UI_AUTH_FILE });
});

setup.describe.configure({ retries: 2 });

setup('Auth API', async () => {
  await annotations.epic('Auth');
  await annotations.feature('API Authentication');

  const apiContext = await createApiContext();

  await annotations.step('POST /auth/login', async () => {
    const res = await apiContext.post(ENDPOINTS.auth, {
      data: { login: env.apiLogin, password: env.apiPassword },
    });
    expect(res.status()).toBe(200);

    const { token } = await res.json(); // { name, login, token }

    await annotations.step('Save token to file', async () => {
      fs.mkdirSync('playwright/.auth', { recursive: true });
      fs.writeFileSync(API_AUTH_FILE, JSON.stringify({ token }));
    });
  });
  await apiContext.dispose();
});
