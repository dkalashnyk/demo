import { test, expect } from '../../src/fixtures/test';
import annotations from '../../src/utils/annotations';
import { calculateExpectedTotals } from '../../src/utils/priceCalculation';
import { PRODUCTS } from '../../src/test-data/product';
import usersApi, { buildUser } from '../../src/api/users.api';
import { CheckoutFormData } from '../../src/test-data/checkoutFactory';

const p = PRODUCTS.TC03;

test.describe('E2E User purchases a product', () => {
  test('@ui @smoke TC03 New user purchases one product', async ({
    api,
    ctx,
    productsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutSummaryPage,
  }) => {
    await annotations.epic('Web App');
    await annotations.feature('Checkout');
    await annotations.story('Purchase product');

    const payload = buildUser();
    const { res: createRes, json: createdUser } = await usersApi.createUser(api, payload);
    expect(createRes.status()).toBe(200);

    ctx.set<CheckoutFormData>('checkout', {
      firstName: payload.data.firstName,
      lastName: payload.data.lastName,
      zip: payload.data.zip,
    });

    try {
      await annotations.step('Open Products page', async () => {
        await productsPage.open();
        await productsPage.assertOnProductsPage();
      });

      await annotations.step('Add product to cart', async () => {
        await productsPage.expectProductVisible(p.name, {
          price: p.price,
          description: p.description,
          img: p.img,
        });
        await productsPage.addProductToCartByName(p.name);
        await productsPage.expectCartCount(1);
        await productsPage.expectProductButtonState(p.name, 'remove');
      });

      await annotations.step('Navigate to shopping cart', async () => {
        await cartPage.open();
        await cartPage.assertOnCartPage();
      });

      await annotations.step('Verify product in cart', async () => {
        await cartPage.expectNumberOfCartItems(1);
        await cartPage.expectCartItemVisible(p.name, {
          price: p.price,
          description: p.description,
          quantity: '1',
        });
      });

      await annotations.step('Open Checkout page', async () => {
        await cartPage.proceedToCheckout();
        await checkoutStepOnePage.assertOnCheckoutPage();
      });

      await annotations.step('Fill in Checkout information', async () => {
        const { firstName, lastName, zip } = ctx.require<CheckoutFormData>('checkout');
        await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
      });

      await annotations.step('Open Checkout Step 2', async () => {
        await checkoutStepOnePage.clickContinue();
        await checkoutStepTwoPage.assertOnCheckoutPage();
      });

      await annotations.step('Verify order details', async () => {
        await checkoutStepTwoPage.expectNumberOfCartItems(1);
        await checkoutStepTwoPage.expectItemInCart(p.name, {
          price: p.price,
          description: p.description,
          quantity: '1',
        });

        // Verify price calculation using utility
        const totals = calculateExpectedTotals([p]);
        await checkoutStepTwoPage.expectItemTotal(totals.subtotal);
        await checkoutStepTwoPage.expectTaxTotal(totals.tax);
        await checkoutStepTwoPage.expectTotal(totals.total);
      });

      await annotations.step('Finish purchase', async () => {
        await checkoutStepTwoPage.clickFinish();
        await checkoutSummaryPage.assertOnCheckoutPage();
        await checkoutSummaryPage.expectOrderCompleteMessage();
        await checkoutSummaryPage.clickBackHome();
        await productsPage.assertOnProductsPage();
      });
    } finally {
      const { res: deleteRes } = await usersApi.deleteUser(api, createdUser.id);
      expect(deleteRes.status()).toBe(200);
    }
  });
});
