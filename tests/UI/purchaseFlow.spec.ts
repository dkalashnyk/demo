import { test } from '../../src/fixtures/test';
import annotations from '../../src/utils/annotations';
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
    await annotations.epic('E-Commerce');
    await annotations.feature('Checkout');
    await annotations.story('Purchase product');

    const checkoutData = CheckoutFactory.create();
    ctx.set<CheckoutFormData>('checkout', checkoutData);

    await annotations.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await annotations.step('Add product to cart', async () => {
      await productsPage.expectProductVisible(product1.name, {
        price: product1.price,
        description: product1.description,
        img: product1.img,
      });
      await productsPage.addProductToCartByName(product1.name);
      await productsPage.expectCartCount(1);
      await productsPage.expectProductButtonState(product1.name, 'remove');
    });

    await annotations.step('Verify cart contents', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.expectNumberOfCartItems(1);
      await cartPage.expectCartItemVisible(product1.name, {
        price: product1.price,
        description: product1.description,
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

    await annotations.step('Finish purchase', async () => {
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
    await annotations.epic('E-Commerce');
    await annotations.feature('Checkout');
    await annotations.story('User shops and completes purchase with multiple products');

    const checkoutData = CheckoutFactory.create();
    ctx.set<CheckoutFormData>('checkout', checkoutData);

    await annotations.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await annotations.step('Add first product to cart', async () => {
      await productsPage.expectProductVisible(product1.name, {
        price: product1.price,
        description: product1.description,
        img: product1.img,
      });
      await productsPage.addProductToCartByName(product1.name);
      await productsPage.expectCartCount(1);
      await productsPage.expectProductButtonState(product1.name, 'remove');
    });

    await annotations.step('Add second product to cart', async () => {
      await productsPage.expectProductVisible(product2.name, {
        price: product2.price,
        description: product2.description,
        img: product2.img,
      });
      await productsPage.addProductToCartByName(product2.name);
      await productsPage.expectCartCount(2);
      await productsPage.expectProductButtonState(product2.name, 'remove');
    });

    await annotations.step('Navigate to shopping cart', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
    });

    await annotations.step('Verify both products in cart', async () => {
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

    await annotations.step('Proceed to checkout', async () => {
      await cartPage.proceedToCheckout();
      await checkoutStepOnePage.assertOnCheckoutPage();
    });

    await annotations.step('Fill checkout information', async () => {
      const { firstName, lastName, zip } = ctx.require<CheckoutFormData>('checkout');
      await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
      await checkoutStepOnePage.clickContinue();
    });

    await annotations.step('Verify order summary', async () => {
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

    await annotations.step('Verify price calculation', async () => {
      const totals = calculateExpectedTotals([product1, product2]);

      await checkoutStepTwoPage.expectItemTotal(totals.subtotal);
      await checkoutStepTwoPage.expectTaxTotal(totals.tax);
      await checkoutStepTwoPage.expectTotal(totals.total);
    });

    await annotations.step('Complete purchase', async () => {
      await checkoutStepTwoPage.clickFinish();
    });

    await annotations.step('Verify order confirmation', async () => {
      await checkoutSummaryPage.assertOnCheckoutPage();
      await checkoutSummaryPage.expectOrderCompleteMessage();
    });

    await annotations.step('Return to home page', async () => {
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
    await annotations.epic('E-Commerce');
    await annotations.feature('Checkout');
    await annotations.story('User completes purchase with custom checkout data');

    const customCheckoutData = CheckoutFactory.create({
      firstName: 'John',
      lastName: 'Smith',
      zip: '10001',
    });
    ctx.set<CheckoutFormData>('checkout', customCheckoutData);

    await annotations.step('Navigate to Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await annotations.step('Add products with single click', async () => {
      await productsPage.addProductToCartByName(product1.name);
    });

    await annotations.step('Quick checkout process', async () => {
      await cartPage.open();
      await cartPage.proceedToCheckout();

      const { firstName, lastName, zip } = ctx.require<CheckoutFormData>('checkout');
      await checkoutStepOnePage.fillCheckoutInformation(firstName, lastName, zip);
      await checkoutStepOnePage.clickContinue();
    });

    await annotations.step('Review and finalize order', async () => {
      await checkoutStepTwoPage.assertOnCheckoutPage();
      await checkoutStepTwoPage.clickFinish();
    });

    await annotations.step('Confirm successful completion', async () => {
      await checkoutSummaryPage.assertOnCheckoutPage();
      await checkoutSummaryPage.expectOrderCompleteMessage();
    });
  });
});
