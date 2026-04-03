import { test } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { PRODUCTS } from '../../src/test-data/product';

const product = PRODUCTS.TC02;

test.describe('Product Detail Page', () => {
  test('@ui @smoke P-1 User views product page', async ({ productsPage, productDetailPage }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Product Page');
    await allure.story('View product page');

    await allure.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Open product page', async () => {
      await productsPage.clickProductByName(product.name);
    });

    await allure.step('Verify product detail page', async () => {
      await productDetailPage.assertOnProductDetailPage();
      await productDetailPage.expectProductName(product.name);
    });
  });
});
