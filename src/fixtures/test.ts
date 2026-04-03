import type { APIRequestContext } from '@playwright/test';
import { test as base, expect } from '@playwright/test';

import { allureApi } from './allure-api.client';
import { createApiContext } from './createApiContext';
import { ScenarioContext } from '../test-context/scenarioContext';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { CheckoutSummaryPage } from '../pages/CheckoutSummaryPage';
import { DownloadPage } from '../pages/DownloadPage';
import { LoginPage } from '../pages/LoginPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { ProductsPage } from '../pages/ProductsPage';
import { UploadPage } from '../pages/UploadPage';

type Fixtures = {
  ctx: ScenarioContext;
  api: APIRequestContext;
  cartPage: CartPage;
  checkoutStepOnePage: CheckoutStepOnePage;
  checkoutStepTwoPage: CheckoutStepTwoPage;
  checkoutSummaryPage: CheckoutSummaryPage;
  downloadPage: DownloadPage;
  loginPage: LoginPage;
  productDetailPage: ProductDetailPage;
  productsPage: ProductsPage;
  uploadPage: UploadPage;
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

  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },

  checkoutStepOnePage: async ({ page }, use) => {
    await use(new CheckoutStepOnePage(page));
  },

  checkoutStepTwoPage: async ({ page }, use) => {
    await use(new CheckoutStepTwoPage(page));
  },

  checkoutSummaryPage: async ({ page }, use) => {
    await use(new CheckoutSummaryPage(page));
  },

  downloadPage: async ({ page }, use) => {
    await use(new DownloadPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  productDetailPage: async ({ page }, use) => {
    await use(new ProductDetailPage(page));
  },

  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },

  uploadPage: async ({ page }, use) => {
    await use(new UploadPage(page));
  },
});

export { expect };
