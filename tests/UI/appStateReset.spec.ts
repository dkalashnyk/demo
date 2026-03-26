import { test } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { PRODUCTS } from '../../src/test-data/product';
import { ProductsPage } from '../../src/pages/ProductsPage';

const product = PRODUCTS.TC02;

test.describe('App State Management', () => {
  test('@ui TC06 Reset app state clears cart items', async ({ page }) => {
    // ===== METADATA =====
    await allure.epic('E-Commerce');
    await allure.feature('App State Management');
    await allure.story('User resets app state and cart is cleared');
    await allure.severity('normal');

    // ===== SETUP =====
    const productsPage = new ProductsPage(page);

    // ===== ACT & VERIFY =====
    await allure.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Add product to cart', async () => {
      await productsPage.addProductToCartByName(product.name);
      await productsPage.expectCartCount(1);
      await productsPage.expectProductButtonState(product.name, 'remove');
    });

    await allure.step('Reset app state via menu', async () => {
      await productsPage.header.resetAppState();
    });

    await allure.step('Refresh page', async () => {
      await page.reload();
    });

    await allure.step('Verify cart is empty after reset', async () => {
      await productsPage.assertOnProductsPage();
      await productsPage.expectCartCount(0);
      await productsPage.expectProductButtonState(product.name, 'add');
    });
  });
});
