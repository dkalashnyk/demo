import { test } from '../../src/fixtures/test';
import annotations from '../../src/utils/annotations';
import { PRODUCTS } from '../../src/test-data/product';

const product = PRODUCTS.TC02;

test.describe('Product Detail Page', () => {
  test('@ui @smoke P-1 User views product page', async ({ productsPage, productDetailPage }) => {
    await annotations.epic('E-Commerce');
    await annotations.feature('Product Page');
    await annotations.story('View product page');

    await annotations.step('Open Products page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await annotations.step('Open product page', async () => {
      await productsPage.clickProductByName(product.name);
    });

    await annotations.step('Verify product detail page', async () => {
      await productDetailPage.assertOnProductDetailPage();
      await productDetailPage.expectProductName(product.name);
    });
  });
});
