import { test } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { PRODUCTS } from '../../src/test-data/product';
import { ProductsPage } from '../../src/pages/ProductsPage';
import { CartPage } from '../../src/pages/CartPage';
import { CheckoutStepOnePage } from '../../src/pages/CheckoutStepOnePage';

const product = PRODUCTS.TC02;

test.describe('Reset App State', () => {
  test('@ui @smoke P-1 Reset clears cart, hides badge after reload, and preserves login session', async ({
    page,
  }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Reset App State');
    await allure.story('Reset clears cart and preserves session');

    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await allure.step('Open Products page and add product to cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await allure.step('Reset app state and reload', async () => {
      await productsPage.header.resetAppState();
      await page.reload();
    });

    await allure.step('Verify cart badge is hidden and button reverted', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.expectProductButtonState(product.name, 'add');
    });

    await allure.step('Verify user is still logged in on Products page', async () => {
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Verify Cart page shows 0 items', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.expectNumberOfCartItems(0);
    });
  });

  test('@ui N-1 Reset then re-add items to cart', async ({ page }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Reset App State');
    await allure.story('Cart functions normally after reset');

    const productsPage = new ProductsPage(page);

    await allure.step('Open Products page and add product to cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await allure.step('Reset app state and reload', async () => {
      await productsPage.header.resetAppState();
      await page.reload();
    });

    await allure.step('Verify cart is empty after reset', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.expectProductButtonState(product.name, 'add');
    });

    await allure.step('Re-add the same product to cart', async () => {
      await productsPage.addProductToCartByName(product.name);
    });

    await allure.step('Verify cart works normally after reset', async () => {
      await productsPage.expectCartCount(1);
      await productsPage.expectProductButtonState(product.name, 'remove');
    });
  });

  test('@ui P-2 Reset on empty cart is a no-op', async ({ page }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Reset App State');
    await allure.story('Reset on empty cart');

    const productsPage = new ProductsPage(page);

    await allure.step('Open Products page with empty cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.expectCartCount(0);
    });

    await allure.step('Reset app state and reload', async () => {
      await productsPage.header.resetAppState();
      await page.reload();
    });

    await allure.step('Verify cart is still empty and page is intact', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.assertOnProductsPage();
    });
  });

  test('@ui P-3 Reset triggered from the Cart page clears cart', async ({ page }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Reset App State');
    await allure.story('Reset from Cart page');

    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);

    await allure.step('Open Products page and add product to cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await allure.step('Navigate to Cart page', async () => {
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.expectNumberOfCartItems(1);
    });

    await allure.step('Reset app state from Cart page and reload', async () => {
      await cartPage.header.resetAppState();
      await page.reload();
    });

    await allure.step('Verify cart is empty after reset', async () => {
      await cartPage.expectNumberOfCartItems(0);
      await cartPage.header.expectCartCount(0);
    });
  });

  test('@ui N-2 Multiple consecutive resets', async ({ page }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Reset App State');
    await allure.story('Multiple consecutive resets');

    const productsPage = new ProductsPage(page);

    await allure.step('Open Products page and add product to cart', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
    });

    await allure.step('First reset', async () => {
      await productsPage.header.resetAppState();
    });

    await allure.step('Reset app state and reload', async () => {
      await productsPage.header.closeMenu();
      await productsPage.header.resetAppState();
      await page.reload();
    });

    await allure.step('Verify cart is empty', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.assertOnProductsPage();
    });
  });

  test('@ui N-3 Reset during checkout flow returns to clean state', async ({ page }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Reset App State');
    await allure.story('Reset during checkout');

    const productsPage = new ProductsPage(page);
    const cartPage = new CartPage(page);
    const checkoutStepOnePage = new CheckoutStepOnePage(page);

    await allure.step('Add product and proceed to checkout', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
      await cartPage.open();
      await cartPage.assertOnCartPage();
      await cartPage.proceedToCheckout();
      await checkoutStepOnePage.assertOnCheckoutPage();
    });

    await allure.step('Reset app state from Checkout Step One page', async () => {
      await checkoutStepOnePage.header.resetAppState();
    });

    await allure.step('Navigate back to Products page', async () => {
      await productsPage.open();
    });

    await allure.step('Verify cart is empty and buttons are in add state', async () => {
      await productsPage.expectCartCount(0);
      await productsPage.expectProductButtonState(product.name, 'add');
    });
  });
});
