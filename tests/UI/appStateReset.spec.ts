import { test } from '../../src/fixtures/test';
import annotations from '../../src/utils/annotations';
import { PRODUCTS } from '../../src/test-data/product';

const product = PRODUCTS.TC02;

test.describe('Reset App State', () => {
  test('@ui @smoke P-1 Reset clears cart, hides badge after reload, and preserves login session', async ({
    page,
    productsPage,
    cartPage,
  }) => {
    await annotations.epic('E-Commerce');
    await annotations.feature('Reset App State');
    await annotations.story('Reset clears cart and preserves session');

    await annotations.step('Open Products page and add product to cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await annotations.step('Reset app state and reload', async () => {
      await productsPage.header.resetAppState();
      await page.reload();
    });

    await annotations.step('Verify cart badge is hidden and button reverted', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.expectProductButtonState(product.name, 'add');
    });

    await annotations.step('Verify user is still logged in on Products page', async () => {
      await productsPage.assertOnProductsPage();
    });

    await annotations.step('Verify Cart page shows 0 items', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.expectNumberOfCartItems(0);
    });
  });

  test('@ui N-1 Reset then re-add items to cart', async ({ page, productsPage }) => {
    await annotations.epic('E-Commerce');
    await annotations.feature('Reset App State');
    await annotations.story('Cart functions normally after reset');

    await annotations.step('Open Products page and add product to cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await annotations.step('Reset app state and reload', async () => {
      await productsPage.header.resetAppState();
      await page.reload();
    });

    await annotations.step('Verify cart is empty after reset', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.expectProductButtonState(product.name, 'add');
    });

    await annotations.step('Re-add the same product to cart', async () => {
      await productsPage.addProductToCartByName(product.name);
    });

    await annotations.step('Verify cart works normally after reset', async () => {
      await productsPage.expectCartCount(1);
      await productsPage.expectProductButtonState(product.name, 'remove');
    });
  });

  test('@ui P-2 Reset on empty cart is a no-op', async ({ page, productsPage }) => {
    await annotations.epic('E-Commerce');
    await annotations.feature('Reset App State');
    await annotations.story('Reset on empty cart');

    await annotations.step('Open Products page with empty cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.expectCartCount(0);
    });

    await annotations.step('Reset app state and reload', async () => {
      await productsPage.header.resetAppState();
      await page.reload();
    });

    await annotations.step('Verify cart is still empty and page is intact', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.assertOnProductsPage();
    });
  });

  test('@ui P-3 Reset triggered from the Cart page clears cart', async ({
    page,
    productsPage,
    cartPage,
  }) => {
    await annotations.epic('E-Commerce');
    await annotations.feature('Reset App State');
    await annotations.story('Reset from Cart page');

    await annotations.step('Open Products page and add product to cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await annotations.step('Navigate to Cart page', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.expectNumberOfCartItems(1);
    });

    await annotations.step('Reset app state from Cart page and reload', async () => {
      await cartPage.header.resetAppState();
      await page.reload();
    });

    await annotations.step('Verify cart is empty after reset', async () => {
      await cartPage.expectNumberOfCartItems(0);
      await cartPage.header.expectCartCount(0);
    });
  });

  test('@ui N-2 Multiple consecutive resets', async ({ page, productsPage }) => {
    await annotations.epic('E-Commerce');
    await annotations.feature('Reset App State');
    await annotations.story('Multiple consecutive resets');

    await annotations.step('Open Products page and add product to cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await annotations.step('First reset', async () => {
      await productsPage.header.resetAppState();
    });

    await annotations.step('Reset app state and reload', async () => {
      await productsPage.header.closeMenu();
      await productsPage.header.resetAppState();
      await page.reload();
    });

    await annotations.step('Verify cart is empty', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.assertOnProductsPage();
    });
  });

  test('@ui N-3 Reset during checkout flow returns to clean state', async ({
    productsPage,
    cartPage,
    checkoutStepOnePage,
  }) => {
    await annotations.epic('E-Commerce');
    await annotations.feature('Reset App State');
    await annotations.story('Reset during checkout');

    await annotations.step('Add product and proceed to checkout', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.proceedToCheckout();
      await checkoutStepOnePage.assertOnCheckoutPage();
    });

    await annotations.step('Reset app state from Checkout Step One page', async () => {
      await checkoutStepOnePage.header.resetAppState();
    });

    await annotations.step('Navigate back to Products page', async () => {
      await productsPage.open();
    });

    await annotations.step('Verify cart is empty and buttons are in add state', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.expectProductButtonState(product.name, 'add');
    });
  });
});
