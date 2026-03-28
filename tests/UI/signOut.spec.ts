import { test, expect } from '../../src/fixtures/test';
import allure from '../../src/utils/allure';
import { ProductsPage } from '../../src/pages/ProductsPage';

test.describe('Sign Out', () => {
  test('@ui P-3 User signs out of SauceDemo', async ({ page }) => {
    await allure.epic('E-Commerce');
    await allure.feature('Authentication');
    await allure.story('Sign out');

    const productsPage = new ProductsPage(page);

    await allure.step('Open inventory page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await allure.step('Sign out via hamburger menu', async () => {
      await productsPage.header.logout();
    });

    await allure.step('Verify redirect to login page', async () => {
      await expect(page).not.toHaveURL(/\/inventory/);
      await expect(page.getByTestId('login-button')).toBeVisible();
    });
  });
});
