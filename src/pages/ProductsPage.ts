import { Page, Locator, expect } from '@playwright/test';

import { BasePage } from './BasePage';
import { Header } from './components/Header';

export class ProductsPage extends BasePage {
  readonly header: Header;

  private readonly products = this.page.getByTestId('inventory-item');

  constructor(page: Page) {
    super(page);
    this.header = new Header(page);
  }

  private productItem(name: string): Locator {
    return this.products.filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: name }),
    });
  }

  private productPrice(name: string): Locator {
    return this.productItem(name).getByTestId('inventory-item-price');
  }

  private productDescription(name: string): Locator {
    return this.productItem(name).getByTestId('inventory-item-desc');
  }

  private productImage(name: string): Locator {
    return this.productItem(name).locator('.inventory_item_img').getByRole('img');
  }

  private addItemToCartButton(name: string): Locator {
    return this.productItem(name).getByRole('button', { name: 'Add to cart' });
  }

  private removeItemFromCartButton(name: string): Locator {
    return this.productItem(name).getByRole('button', { name: 'Remove' });
  }

  async open(): Promise<void> {
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

  async clickProductByName(name: string): Promise<void> {
    await this.productItem(name).getByTestId('inventory-item-name').click();
  }

  async expectCartCount(count: number): Promise<void> {
    await this.header.expectCartCount(count);
  }

  async expectProductButtonState(name: string, buttonType: 'add' | 'remove'): Promise<void> {
    if (buttonType === 'add') {
      await expect(this.addItemToCartButton(name)).toBeVisible();
      await expect(this.removeItemFromCartButton(name)).not.toBeVisible();
    } else {
      await expect(this.removeItemFromCartButton(name)).toBeVisible();
      await expect(this.addItemToCartButton(name)).not.toBeVisible();
    }
  }
}
