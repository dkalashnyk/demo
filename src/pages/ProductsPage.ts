import { Page, Locator, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/header';

export class ProductsPage extends BasePage {
  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  readonly header: Header;

  private readonly products = this.page.getByTestId('inventory-item');

  private productItem(name: string): Locator {
    return this.products.filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: name }),
    });
  }

  productPrice(name: string): Locator {
    return this.productItem(name).getByTestId('inventory-item-price');
  }

  productDescription(name: string): Locator {
    return this.productItem(name).getByTestId('inventory-item-desc');
  }

  productImage(name: string): Locator {
    return this.productItem(name).locator('.inventory_item_img').getByRole('img');
  }

  addItemToCartButton(name: string): Locator {
    return this.productItem(name).getByRole('button', { name: 'Add to cart' });
  }

  removeItemFromCartButton(name: string): Locator {
    return this.productItem(name).getByRole('button', { name: 'Remove' });
  }

  async openProductsPage(): Promise<void> {
    await this.page.goto('/inventory.html');
  }

  async assertOnProductsPage(): Promise<void> {
    await this.expectUrlContains('/inventory.html');
    await this.header.expectTitle('Products');
  }

  async addProductToCartByName(name: string): Promise<void> {
    await this.addItemToCartButton(name).click();
    await expect(this.removeItemFromCartButton(name)).toBeVisible();
  }

  async expectProductVisible(
    name: string,
    expected: { price: string; description?: string; img: string },
  ): Promise<void> {
    await expect(this.productPrice(name)).toContainText(expected.price);
    if (expected.description) {
      await expect(this.productDescription(name)).toHaveText(expected.description);
    }
    await expect(this.productImage(name)).toHaveAttribute('alt', expected.img);
  }

  async expectCartCount(count: number): Promise<void> {
    await this.header.expectCartCount(count);
  }
}
