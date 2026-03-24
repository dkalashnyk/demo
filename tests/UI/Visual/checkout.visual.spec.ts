import { test, expect } from '../../../src/fixtures/test';
import allure from '../../../src/utils/allure';
import { PRODUCTS } from '../../../src/test-data/product';
import { ProductsPage } from '../../../src/pages/ProductsPage';
import { CartPage } from '../../../src/pages/CartPage';
import { CheckoutStepOnePage } from '../../../src/pages/CheckoutStepOnePage';
import { CheckoutStepTwoPage } from '../../../src/pages/CheckoutStepTwoPage';
import { CheckoutSummaryPage } from '../../../src/pages/CheckoutSummaryPage';
import usersApi, { buildUser } from '../../../src/api/users.api';

const p = PRODUCTS.TC03;

test.describe('Visual checkout', () => {
  test('@visual Visual test for purchasing a product', async ({ page, api, ctx }) => {
    await allure.epic('Web App');
    await allure.feature('Visual Testing');
    await allure.story('Purchase product');

    const payload = buildUser();
    const { res: createRes, json: createdUser } = await usersApi.createUser(api, payload);
    expect(createRes.status()).toBe(200);

    // Store in context for use across steps
    ctx.set('checkout', {
      firstName: payload.data.firstName,
      lastName: payload.data.lastName,
      zip: payload.data.zip,
    });

    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOnePage = new CheckoutStepOnePage(page);
    const checkoutStepTwoPage = new CheckoutStepTwoPage(page);
    const checkoutSummaryPage = new CheckoutSummaryPage(page);

    try {
      await allure.step('Open Products page', async () => {
        await productsPage.openProductsPage();
        await productsPage.assertVisual();
      });

      await allure.step('Add product to cart', async () => {
        await productsPage.addProductToCartByName(p.name);
        await productsPage.assertVisual();
      });

      await allure.step('Verify cart contents', async () => {
        await cartPage.openCartPage();
        await cartPage.assertOnCartPage();
        await cartPage.assertVisual();
      });

      await allure.step('Open Checkout page', async () => {
        await cartPage.openCheckoutPage();
        await checkoutStepOnePage.assertOnCheckoutPage();
        await checkoutStepOnePage.assertVisual();
      });

      await allure.step('Fill in Checkout information', async () => {
        const { firstName, lastName, zip } = ctx.require('checkout');
        await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
      });

      await allure.step('Open Checkout Step 2', async () => {
        await checkoutStepOnePage.clickContinue();
        await checkoutStepTwoPage.assertOnCheckoutPage();
        await checkoutStepTwoPage.assertVisual();
      });

      await allure.step('Verify order details', async () => {
        await checkoutStepTwoPage.assertVisual();
      });

      await allure.step('Finish purchase', async () => {
        await checkoutStepTwoPage.clickFinish();
        await checkoutSummaryPage.assertOnCheckoutPage();
        await checkoutSummaryPage.assertVisual();
        await checkoutSummaryPage.clickBackHome();
        await productsPage.assertOnProductsPage();
        await productsPage.assertVisual();
      });
    } finally {
      const { res: deleteRes } = await usersApi.deleteUser(api, createdUser.id);
      expect(deleteRes.status()).toBe(200);
    }
  });
});
