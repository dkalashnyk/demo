import { test, expect } from '../../src/fixtures/test';
import annotations from '../../src/utils/annotations';

test.describe('Sign Out', () => {
  test('@ui P-3 User signs out of SauceDemo', async ({ page, productsPage }) => {
    await annotations.epic('E-Commerce');
    await annotations.feature('Authentication');
    await annotations.story('Sign out');

    await annotations.step('Open inventory page', async () => {
      await productsPage.open();
      await productsPage.assertOnProductsPage();
    });

    await annotations.step('Sign out via hamburger menu', async () => {
      await productsPage.header.logout();
    });

    await annotations.step('Verify redirect to login page', async () => {
      await expect(page).not.toHaveURL(/\/inventory/);
      await expect(page.getByTestId('login-button')).toBeVisible();
    });
  });
});
