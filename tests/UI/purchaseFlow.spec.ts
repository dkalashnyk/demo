import { test } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { calculateExpectedTotals } from '../../src/utils/priceCalculation';
import { PRODUCTS } from '../../src/test-data/product';
import { CheckoutFactory, CheckoutFormData } from '../../src/test-data/checkoutFactory';

const product1 = PRODUCTS.TC02;
const product2 = PRODUCTS.TC03;

test.describe('Purchase Flow', () => {
  test('@ui TC02 User purchases one product', async ({
    productsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutSummaryPage,
    ctx,
  }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Checkout');
    await allure.story('Purchase product');

    const checkoutData = CheckoutFactory.create();
    ctx.set<CheckoutFormData>('checkout', checkoutData);

    await allure.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Add product to cart', async () => {
      await productsPage.expectProductVisible(product1.name, {
        price: product1.price,
        description: product1.description,
        img: product1.img,
      });
      await productsPage.addProductToCartByName(product1.name);
      await productsPage.expectCartCount(1);
      await productsPage.expectProductButtonState(product1.name, 'remove');
    });

    await allure.step('Verify cart contents', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.expectNumberOfCartItems(1);
      await cartPage.expectCartItemVisible(product1.name, {
        price: product1.price,
        description: product1.description,
        quantity: '1',
      });
    });

    await allure.step('Open Checkout page', async () => {
      await cartPage.proceedToCheckout();
      await checkoutStepOnePage.assertOnCheckoutPage();
    });

    await allure.step('Fill in Checkout information', async () => {
      const { firstName, lastName, zip } = ctx.require<CheckoutFormData>('checkout');
      await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
    });

    await allure.step('Open Checkout Step 2', async () => {
      await checkoutStepOnePage.clickContinue();
      await checkoutStepTwoPage.assertOnCheckoutPage();
    });

    await allure.step('Verify order details', async () => {
      await checkoutStepTwoPage.expectNumberOfCartItems(1);
      await checkoutStepTwoPage.expectItemInCart(product1.name, {
        price: product1.price,
        description: product1.description,
        quantity: '1',
      });

      // Verify price calculation using utility
      const totals = calculateExpectedTotals([product1]);
      await checkoutStepTwoPage.expectItemTotal(totals.subtotal);
      await checkoutStepTwoPage.expectTaxTotal(totals.tax);
      await checkoutStepTwoPage.expectTotal(totals.total);
    });

    await allure.step('Finish purchase', async () => {
      await checkoutStepTwoPage.clickFinish();
      await checkoutSummaryPage.assertOnCheckoutPage();
      await checkoutSummaryPage.expectOrderCompleteMessage();
      await checkoutSummaryPage.clickBackHome();
      await productsPage.assertOnProductsPage();
    });
  });

  test('@ui TC04 User adds 2 products to cart and completes purchase', async ({
    productsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutSummaryPage,
    ctx,
  }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Checkout');
    await allure.story('User shops and completes purchase with multiple products');

    const checkoutData = CheckoutFactory.create();
    ctx.set<CheckoutFormData>('checkout', checkoutData);

    await allure.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Add first product to cart', async () => {
      await productsPage.expectProductVisible(product1.name, {
        price: product1.price,
        description: product1.description,
        img: product1.img,
      });
      await productsPage.addProductToCartByName(product1.name);
      await productsPage.expectCartCount(1);
      await productsPage.expectProductButtonState(product1.name, 'remove');
    });

    await allure.step('Add second product to cart', async () => {
      await productsPage.expectProductVisible(product2.name, {
        price: product2.price,
        description: product2.description,
        img: product2.img,
      });
      await productsPage.addProductToCartByName(product2.name);
      await productsPage.expectCartCount(2);
      await productsPage.expectProductButtonState(product2.name, 'remove');
    });

    await allure.step('Navigate to shopping cart', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
    });

    await allure.step('Verify both products in cart', async () => {
      await cartPage.expectNumberOfCartItems(2);
      await cartPage.expectCartItemVisible(product1.name, {
        price: product1.price,
        quantity: '1',
      });
      await cartPage.expectCartItemVisible(product2.name, {
        price: product2.price,
        quantity: '1',
      });
    });

    await allure.step('Proceed to checkout', async () => {
      await cartPage.proceedToCheckout();
      await checkoutStepOnePage.assertOnCheckoutPage();
    });

    await allure.step('Fill checkout information', async () => {
      const { firstName, lastName, zip } = ctx.require<CheckoutFormData>('checkout');
      await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
      await checkoutStepOnePage.clickContinue();
    });

    await allure.step('Verify order summary', async () => {
      await checkoutStepTwoPage.assertOnCheckoutPage();
      await checkoutStepTwoPage.expectCartItemVisible(product1.name, {
        price: product1.price,
        quantity: '1',
      });
      await checkoutStepTwoPage.expectCartItemVisible(product2.name, {
        price: product2.price,
        quantity: '1',
      });
    });

    await allure.step('Verify price calculation', async () => {
      const totals = calculateExpectedTotals([product1, product2]);

      await checkoutStepTwoPage.expectItemTotal(totals.subtotal);
      await checkoutStepTwoPage.expectTaxTotal(totals.tax);
      await checkoutStepTwoPage.expectTotal(totals.total);
    });

    await allure.step('Complete purchase', async () => {
      await checkoutStepTwoPage.clickFinish();
    });

    await allure.step('Verify order confirmation', async () => {
      await checkoutSummaryPage.assertOnCheckoutPage();
      await checkoutSummaryPage.expectOrderCompleteMessage();
    });

    await allure.step('Return to home page', async () => {
      await checkoutSummaryPage.clickBackHome();
      await productsPage.assertOnProductsPage();
    });
  });

  test('@ui TC05 User can proceed with different checkout details', async ({
    productsPage,
    cartPage,
    checkoutStepOnePage,
    checkoutStepTwoPage,
    checkoutSummaryPage,
    ctx,
  }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Checkout');
    await allure.story('User completes purchase with custom checkout data');

    const customCheckoutData = CheckoutFactory.create({
      firstName: 'John',
      lastName: 'Smith',
      zip: '10001',
    });
    ctx.set<CheckoutFormData>('checkout', customCheckoutData);

    await allure.step('Navigate to Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Add products with single click', async () => {
      await productsPage.addProductToCartByName(product1.name);
    });

    await allure.step('Quick checkout process', async () => {
      await cartPage.open();
      await cartPage.proceedToCheckout();

      const { firstName, lastName, zip } = ctx.require<CheckoutFormData>('checkout');
      await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
      await checkoutStepOnePage.clickContinue();
    });

    await allure.step('Review and finalize order', async () => {
      await checkoutStepTwoPage.assertOnCheckoutPage();
      await checkoutStepTwoPage.clickFinish();
    });

    await allure.step('Confirm successful completion', async () => {
      await checkoutSummaryPage.assertOnCheckoutPage();
      await checkoutSummaryPage.expectOrderCompleteMessage();
    });
  });
});
