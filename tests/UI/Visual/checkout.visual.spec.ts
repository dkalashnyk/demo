import { test, expect } from '../../../src/fixtures/test';
import allure from '../../../src/utils/allure';
import { PRODUCTS } from '../../../src/test-data/product';
import usersApi, { buildUser } from '../../../src/api/users.api';
import { CheckoutFactory, CheckoutFormData } from '../../../src/test-data/checkoutFactory';

const p = PRODUCTS.TC03;

test.describe('Visual checkout', () => {
  test('@visual Visual test for purchasing a product', async ({
    productsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutSummaryPage,
    api,
    ctx,
  }) => {
    await allure.epic('Web App');
    await allure.feature('Visual Testing');
    await allure.story('Purchase product');

    const payload = buildUser();
    const { res: createRes, json: createdUser } = await usersApi.createUser(api, payload);
    expect(createRes.status()).toBe(200);

    const checkoutData = CheckoutFactory.create();
    ctx.set<CheckoutFormData>('checkout', checkoutData);

    try {
      await allure.step('Open Products page', async () => {
        await productsPage.open();
        await productsPage.assertVisual();
      });

      await allure.step('Add product to cart', async () => {
        await productsPage.addProductToCartByName(p.name);
        await productsPage.assertVisual();
      });

      await allure.step('Open Cart page', async () => {
        await cartPage.open();
        await cartPage.assertOnCartPage();
        await cartPage.assertVisual();
      });

      await allure.step('Open Checkout page', async () => {
        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.assertOnCheckoutPage();
        await checkoutStepOnePage.assertVisual();
      });

      await allure.step('Fill in Checkout information', async () => {
        const { firstName, lastName, zip } = ctx.require<CheckoutFormData>('checkout');
        await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
      });

      await allure.step('Open Checkout Step 2', async () => {
        await checkoutStepOnePage.clickContinue();
        await checkoutStepTwoPage.assertOnCheckoutPage();
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

  test('@visual V-1 Product detail page visual regression', async ({
    productsPage,
    productDetailPage,
  }) => {
    await allure.epic('Web App');
    await allure.feature('Visual Testing');
    await allure.story('Product detail page');

    await allure.step('Navigate to product detail page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.clickProductByName(p.name);
      await productDetailPage.assertOnProductDetailPage();
      await productDetailPage.assertVisual();
    });
  });
});
